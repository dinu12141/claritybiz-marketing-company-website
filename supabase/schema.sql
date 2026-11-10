-- =====================================================================
--  TV Clarity Capital (Pvt) Ltd — Business Management Platform
--  Supabase schema: tables, RLS, storage, triggers, RPCs and seeds.
--  Run this file in the Supabase SQL editor (it is safe to re-run).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type public.consultation_status as enum
    ('new','under_review','contacted','consultation_scheduled','proposal_sent','converted','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin create type public.consultation_priority as enum ('low','medium','high','urgent'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contact_method as enum ('phone','whatsapp','email'); exception when duplicate_object then null; end $$;
do $$ begin create type public.post_status as enum ('draft','published','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.lead_status as enum ('new','active','converted','lost'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_type as enum ('text','textarea','select','radio','multiselect'); exception when duplicate_object then null; end $$;
do $$ begin create type public.media_kind as enum ('logo','favicon','image','blog','document'); exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Roles, permissions, profiles
-- ---------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role_id uuid references public.roles(id) on delete set null,
  is_active boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role_id);

-- ---------------------------------------------------------------------
-- Authorization helpers (SECURITY DEFINER → bypass RLS safely)
-- ---------------------------------------------------------------------
create or replace function public.current_role_key()
returns text language sql stable security definer set search_path = public as $$
  select r.key from public.profiles p join public.roles r on r.id = p.role_id
  where p.id = auth.uid() and p.is_active;
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active and p.role_id is not null);
$$;

create or replace function public.has_permission(p_key text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.current_role_key() = 'super_admin' then true
    else exists (
      select 1 from public.profiles p
      join public.role_permissions rp on rp.role_id = p.role_id
      join public.permissions perm on perm.id = rp.permission_id
      where p.id = auth.uid() and p.is_active and perm.key = p_key)
  end;
$$;

create or replace function public.my_permissions()
returns setof text language sql stable security definer set search_path = public as $$
  select perm.key from public.permissions perm
  where public.current_role_key() = 'super_admin'
     or exists (
      select 1 from public.profiles p
      join public.role_permissions rp on rp.role_id = p.role_id
      where p.id = auth.uid() and p.is_active and rp.permission_id = perm.id);
$$;

grant execute on function public.my_permissions() to authenticated;

-- ---------------------------------------------------------------------
-- Generic triggers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_resource_idx on public.audit_logs(resource_type, resource_id);

create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_action text; v_res_id text; v_details jsonb; v_new jsonb; v_old jsonb; v_changes jsonb;
begin
  v_new := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_res_id := coalesce(v_new->>'id', v_old->>'id', v_new->>'key', v_old->>'key', v_new->>'page_path', v_old->>'page_path');

  if tg_op = 'INSERT' then
    v_action := 'create';
    v_details := jsonb_build_object('summary', coalesce(v_new->>'name', v_new->>'title', v_new->>'question', v_new->>'reference', v_new->>'full_name', v_new->>'file_name', v_new->>'key'));
  elsif tg_op = 'DELETE' then
    v_action := 'delete';
    v_details := jsonb_build_object('summary', coalesce(v_old->>'name', v_old->>'title', v_old->>'question', v_old->>'reference', v_old->>'full_name', v_old->>'file_name', v_old->>'key'));
  else
    v_action := 'update';
    if tg_table_name = 'consultations' and (v_new->>'status') is distinct from (v_old->>'status') then v_action := 'status_change'; end if;
    if tg_table_name = 'profiles' and (v_new->>'role_id') is distinct from (v_old->>'role_id') then v_action := 'role_change'; end if;
    if tg_table_name in ('site_settings','seo_settings') then v_action := 'settings_update'; end if;
    if v_action = 'update' and tg_table_name in ('pages','page_sections','faqs','blog_posts','services','service_questions') then v_action := 'content_update'; end if;
    select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb) into v_changes
      from jsonb_each(v_new) e
      where v_old->e.key is distinct from e.value and e.key not in ('updated_at','last_login_at');
    if v_changes = '{}'::jsonb then
      if tg_op = 'DELETE' then return old; else return new; end if;  -- nothing meaningful changed
    end if;
    v_details := jsonb_build_object(
      'summary', coalesce(v_new->>'name', v_new->>'title', v_new->>'question', v_new->>'reference', v_new->>'full_name', v_new->>'file_name', v_new->>'key'),
      'changes', v_changes);
  end if;

  insert into public.audit_logs (actor_id, action, resource_type, resource_id, details)
  values (auth.uid(), v_action, tg_table_name, v_res_id, v_details);

  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

-- ---------------------------------------------------------------------
-- Profiles: auto-create on signup; protect role/status changes
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_count int; v_role uuid;
begin
  select count(*) into v_count from public.profiles;
  if v_count = 0 then
    -- The very first account becomes the Super Admin.
    select id into v_role from public.roles where key = 'super_admin';
    insert into public.profiles (id, email, full_name, role_id, is_active)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), v_role, true);
  else
    insert into public.profiles (id, email, full_name, role_id, is_active)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), null, false);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_super uuid;
begin
  new.updated_at := now();
  if auth.uid() is null then return new; end if;          -- service role / SQL editor
  if (new.role_id is distinct from old.role_id) or (new.is_active is distinct from old.is_active) then
    if not public.has_permission('users.manage') then
      raise exception 'You are not allowed to change roles or account status';
    end if;
    if new.id = auth.uid() then
      raise exception 'You cannot change your own role or status';
    end if;
    select id into v_super from public.roles where key = 'super_admin';
    if (new.role_id = v_super or old.role_id = v_super) and public.current_role_key() <> 'super_admin' then
      raise exception 'Only a super admin can grant or revoke the super admin role';
    end if;
  end if;
  if new.id <> auth.uid() and not public.has_permission('users.manage') then
    raise exception 'You can only edit your own profile';
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit after update or delete on public.profiles
  for each row execute function public.audit_row_change();

-- ---------------------------------------------------------------------
-- Services & dynamic questions
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  short_description text,
  full_description text,
  icon text,
  features jsonb not null default '[]'::jsonb,
  cta_text text,
  hero_title text,
  hero_text text,
  sections jsonb,
  audience jsonb,
  journey jsonb,
  disclaimer text,
  image_url text,
  seo_title text,
  seo_description text,
  is_enabled boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_sort_idx on public.services(sort_order);

create table if not exists public.service_questions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  key text not null,
  label text not null,
  type public.question_type not null default 'text',
  placeholder text,
  help_text text,
  is_required boolean not null default false,
  is_enabled boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  unique (service_id, key)
);
create index if not exists service_questions_service_idx on public.service_questions(service_id, sort_order);

create table if not exists public.service_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.service_questions(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order int not null default 100
);
create index if not exists service_question_options_q_idx on public.service_question_options(question_id, sort_order);

-- ---------------------------------------------------------------------
-- Leads, clients, consultations
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text,
  phone text not null,
  phone_normalized text,
  whatsapp text,
  email text,
  city text,
  status public.lead_status not null default 'new',
  source text default 'website',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_phone_idx on public.leads(phone_normalized);
create index if not exists leads_email_idx on public.leads(email);
create index if not exists leads_status_idx on public.leads(status);

create sequence if not exists public.consultation_ref_seq start 1;

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  upload_token uuid not null default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  service_slug text not null default 'other',
  service_name text not null default 'Other',
  status public.consultation_status not null default 'new',
  priority public.consultation_priority not null default 'medium',
  client_name text not null,
  business_name text,
  phone text not null,
  whatsapp text,
  email text,
  city text,
  preferred_contact public.contact_method not null default 'phone',
  preferred_date date,
  preferred_time text,
  preferred_timezone text,
  summary text,
  source text not null default 'website',
  lead_id uuid references public.leads(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  follow_up_date date,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists consultations_status_idx on public.consultations(status);
create index if not exists consultations_created_idx on public.consultations(created_at desc);
create index if not exists consultations_assigned_idx on public.consultations(assigned_to);
create index if not exists consultations_lead_idx on public.consultations(lead_id);
create index if not exists consultations_service_idx on public.consultations(service_slug);
create index if not exists consultations_scheduled_idx on public.consultations(scheduled_at);
create index if not exists consultations_follow_up_idx on public.consultations(follow_up_date);
create index if not exists consultations_priority_idx on public.consultations(priority);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  consultation_id uuid unique references public.consultations(id) on delete set null,
  full_name text not null,
  business_name text,
  phone text,
  whatsapp text,
  email text,
  city text,
  notes text,
  converted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.consultation_answers (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  question_key text not null,
  question_label text not null,
  answer text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists consultation_answers_c_idx on public.consultation_answers(consultation_id, sort_order);

create table if not exists public.consultation_attachments (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists consultation_attachments_c_idx on public.consultation_attachments(consultation_id);

create table if not exists public.consultation_notes (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists consultation_notes_c_idx on public.consultation_notes(consultation_id, created_at desc);

create table if not exists public.consultation_activity (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists consultation_activity_c_idx on public.consultation_activity(consultation_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  recipient_id uuid references public.profiles(id) on delete cascade,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_unread_idx on public.notifications(is_read, created_at desc);

-- ---------------------------------------------------------------------
-- CMS tables
-- ---------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  key text not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  unique (page_id, key)
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_enabled boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  featured_image_url text,
  author_name text,
  category text,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts(status, published_at desc);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  kind public.media_kind not null default 'image',
  alt_text text,
  public_url text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,            -- 'global' or a route such as '/about'
  title text,
  description text,
  og_title text,
  og_description text,
  og_image_url text,
  favicon_url text,
  robots text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['services','leads','consultations','pages','page_sections','faqs','blog_posts','site_settings','seo_settings'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Audit triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['consultations','consultation_notes','consultation_attachments','services','service_questions','faqs','blog_posts','pages','page_sections','media','site_settings','seo_settings','role_permissions','leads','clients'] loop
    execute format('drop trigger if exists %I_audit on public.%I', t, t);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.audit_row_change()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Consultation triggers: reference, activity, notification, conversion
-- ---------------------------------------------------------------------
create or replace function public.set_consultation_reference()
returns trigger language plpgsql as $$
begin
  if new.reference is null then
    new.reference := 'TVC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.consultation_ref_seq')::text, 5, '0');
  end if;
  return new;
end $$;

drop trigger if exists consultations_reference on public.consultations;
create trigger consultations_reference before insert on public.consultations
  for each row execute function public.set_consultation_reference();

create or replace function public.log_consultation_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  if tg_op = 'INSERT' then
    insert into public.consultation_activity (consultation_id, actor_id, type, description, metadata)
    values (new.id, auth.uid(), 'created', 'Consultation request created', jsonb_build_object('reference', new.reference, 'service', new.service_name, 'source', new.source));
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.consultation_activity (consultation_id, actor_id, type, description, metadata)
    values (new.id, auth.uid(), 'status_changed', format('Status changed from %s to %s', replace(old.status::text, '_', ' '), replace(new.status::text, '_', ' ')),
            jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.priority is distinct from old.priority then
    insert into public.consultation_activity (consultation_id, actor_id, type, description, metadata)
    values (new.id, auth.uid(), 'priority_changed', format('Priority changed from %s to %s', old.priority, new.priority),
            jsonb_build_object('from', old.priority, 'to', new.priority));
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    select full_name into v_name from public.profiles where id = new.assigned_to;
    insert into public.consultation_activity (consultation_id, actor_id, type, description, metadata)
    values (new.id, auth.uid(), 'assigned',
            case when new.assigned_to is null then 'Assignment removed' else format('Assigned to %s', coalesce(v_name, 'a staff member')) end,
            jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to));
  end if;

  if (new.follow_up_date, new.scheduled_at, new.summary, new.client_name, new.business_name, new.phone, new.whatsapp, new.email, new.city)
     is distinct from
     (old.follow_up_date, old.scheduled_at, old.summary, old.client_name, old.business_name, old.phone, old.whatsapp, old.email, old.city) then
    insert into public.consultation_activity (consultation_id, actor_id, type, description, metadata)
    values (new.id, auth.uid(), 'updated', 'Consultation details updated',
            jsonb_build_object('follow_up_date', new.follow_up_date, 'scheduled_at', new.scheduled_at));
  end if;
  return new;
end $$;

drop trigger if exists consultations_activity on public.consultations;
create trigger consultations_activity after insert or update on public.consultations
  for each row execute function public.log_consultation_activity();

create or replace function public.notify_new_consultation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (type, title, body, entity_type, entity_id, metadata)
  values ('consultation_new', 'New consultation request received',
          format('%s • %s', new.client_name, new.service_name), 'consultation', new.id,
          jsonb_build_object('reference', new.reference, 'client_name', new.client_name, 'service', new.service_name));
  return new;
end $$;

drop trigger if exists consultations_notify on public.consultations;
create trigger consultations_notify after insert on public.consultations
  for each row execute function public.notify_new_consultation();

create or replace function public.handle_consultation_conversion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'converted' and old.status is distinct from 'converted' then
    insert into public.clients (lead_id, consultation_id, full_name, business_name, phone, whatsapp, email, city)
    values (new.lead_id, new.id, new.client_name, new.business_name, new.phone, new.whatsapp, new.email, new.city)
    on conflict (consultation_id) do nothing;
    if new.lead_id is not null then
      update public.leads set status = 'converted', updated_at = now() where id = new.lead_id;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists consultations_conversion on public.consultations;
create trigger consultations_conversion after update on public.consultations
  for each row execute function public.handle_consultation_conversion();

create or replace function public.log_note_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.consultation_activity (consultation_id, actor_id, type, description)
  values (new.consultation_id, coalesce(new.author_id, auth.uid()), 'note_added', 'Internal note added');
  return new;
end $$;

drop trigger if exists consultation_notes_activity on public.consultation_notes;
create trigger consultation_notes_activity after insert on public.consultation_notes
  for each row execute function public.log_note_activity();

create or replace function public.log_attachment_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.consultation_activity (consultation_id, actor_id, type, description, metadata)
  values (new.consultation_id, auth.uid(), 'attachment_uploaded', format('Attachment uploaded: %s', new.file_name), jsonb_build_object('file_name', new.file_name, 'size', new.size_bytes));
  return new;
end $$;

drop trigger if exists consultation_attachments_activity on public.consultation_attachments;
create trigger consultation_attachments_activity after insert on public.consultation_attachments
  for each row execute function public.log_attachment_activity();

-- ---------------------------------------------------------------------
-- Public RPCs (used by the website consultation form)
-- ---------------------------------------------------------------------
create or replace function public.submit_consultation(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_ref text; v_token uuid; v_lead uuid; v_service_id uuid; v_service_name text;
  v_phone text; v_phone_norm text; v_email text; v_contact public.contact_method; a jsonb; i int := 0;
begin
  v_phone := nullif(trim(coalesce(p->>'phone', '')), '');
  if nullif(trim(coalesce(p->>'client_name', '')), '') is null or v_phone is null then
    raise exception 'Client name and phone number are required';
  end if;
  if length(p->>'client_name') > 200 or length(coalesce(p->>'summary', '')) > 6000 or length(v_phone) > 40 then
    raise exception 'Input exceeds the allowed length';
  end if;

  v_phone_norm := regexp_replace(v_phone, '\D', '', 'g');
  v_email := nullif(lower(trim(coalesce(p->>'email', ''))), '');
  v_contact := case when p->>'preferred_contact' in ('phone','whatsapp','email') then (p->>'preferred_contact')::public.contact_method else 'phone' end;

  select id, name into v_service_id, v_service_name from public.services where slug = p->>'service_slug' and is_enabled;
  v_service_name := coalesce(v_service_name, nullif(left(p->>'service_name', 120), ''), 'Other');

  -- Link (or create) the lead
  select id into v_lead from public.leads
   where (v_phone_norm <> '' and phone_normalized = v_phone_norm) or (v_email is not null and email = v_email)
   order by created_at limit 1;

  if v_lead is null then
    insert into public.leads (full_name, business_name, phone, phone_normalized, whatsapp, email, city, source)
    values (left(trim(p->>'client_name'), 200), nullif(left(p->>'business_name', 200), ''), v_phone, v_phone_norm,
            nullif(left(p->>'whatsapp', 40), ''), v_email, nullif(left(p->>'city', 120), ''), coalesce(nullif(p->>'source',''), 'website'))
    returning id into v_lead;
  else
    update public.leads
       set full_name = left(trim(p->>'client_name'), 200),
           business_name = coalesce(nullif(left(p->>'business_name', 200), ''), business_name),
           whatsapp = coalesce(nullif(left(p->>'whatsapp', 40), ''), whatsapp),
           email = coalesce(v_email, email),
           city = coalesce(nullif(left(p->>'city', 120), ''), city),
           status = case when status = 'lost' then 'active'::public.lead_status else status end,
           updated_at = now()
     where id = v_lead;
  end if;

  insert into public.consultations
    (service_id, service_slug, service_name, client_name, business_name, phone, whatsapp, email, city,
     preferred_contact, preferred_date, preferred_time, preferred_timezone, summary, lead_id, source)
  values
    (v_service_id, coalesce(nullif(left(p->>'service_slug', 80), ''), 'other'), v_service_name,
     left(trim(p->>'client_name'), 200), nullif(left(p->>'business_name', 200), ''), v_phone,
     nullif(left(p->>'whatsapp', 40), ''), v_email, nullif(left(p->>'city', 120), ''),
     v_contact,
     case when coalesce(p->>'preferred_date', '') ~ '^\d{4}-\d{2}-\d{2}$' then (p->>'preferred_date')::date else null end,
     nullif(left(p->>'preferred_time', 80), ''), nullif(left(p->>'preferred_timezone', 80), ''),
     nullif(p->>'summary', ''), v_lead, coalesce(nullif(left(p->>'source', 40), ''), 'website'))
  returning id, reference, upload_token into v_id, v_ref, v_token;

  for a in select value from jsonb_array_elements(coalesce(p->'answers', '[]'::jsonb)) loop
    i := i + 1;
    exit when i > 60;
    insert into public.consultation_answers (consultation_id, question_key, question_label, answer, sort_order)
    values (v_id, left(coalesce(a->>'key', 'q' || i), 100), left(coalesce(a->>'label', ''), 300), left(coalesce(a->>'answer', ''), 4000), i);
  end loop;

  return jsonb_build_object('id', v_id, 'reference', v_ref, 'upload_token', v_token);
end $$;

revoke all on function public.submit_consultation(jsonb) from public;
grant execute on function public.submit_consultation(jsonb) to anon, authenticated;

create or replace function public.attach_consultation_file(
  p_consultation_id uuid, p_token uuid, p_path text, p_name text, p_mime text, p_size bigint)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_count int;
begin
  if not exists (select 1 from public.consultations where id = p_consultation_id and upload_token = p_token) then
    raise exception 'Invalid upload token';
  end if;
  if p_path not like p_consultation_id::text || '/%' then
    raise exception 'Invalid storage path';
  end if;
  if coalesce(p_size, 0) > 10485760 then
    raise exception 'File exceeds 10 MB';
  end if;
  select count(*) into v_count from public.consultation_attachments where consultation_id = p_consultation_id;
  if v_count >= 10 then raise exception 'Attachment limit reached'; end if;

  insert into public.consultation_attachments (consultation_id, storage_path, file_name, mime_type, size_bytes)
  values (p_consultation_id, p_path, left(p_name, 255), left(p_mime, 120), p_size)
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.attach_consultation_file(uuid, uuid, text, text, text, bigint) from public;
grant execute on function public.attach_consultation_file(uuid, uuid, text, text, text, bigint) to anon, authenticated;

create or replace function public.log_auth_event(p_event text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_event not in ('login', 'logout') then raise exception 'Invalid auth event'; end if;
  insert into public.audit_logs (actor_id, action, resource_type, resource_id, details)
  values (auth.uid(), p_event, 'auth', auth.uid()::text, '{}'::jsonb);
  if p_event = 'login' then
    update public.profiles set last_login_at = now() where id = auth.uid();
  end if;
end $$;

grant execute on function public.log_auth_event(text) to authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_questions enable row level security;
alter table public.service_question_options enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_answers enable row level security;
alter table public.consultation_attachments enable row level security;
alter table public.consultation_notes enable row level security;
alter table public.consultation_activity enable row level security;
alter table public.notifications enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.faqs enable row level security;
alter table public.blog_posts enable row level security;
alter table public.media enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo_settings enable row level security;
alter table public.audit_logs enable row level security;

-- Drop policies so this script can be re-run
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- roles / permissions
create policy "staff read roles" on public.roles for select to authenticated using (public.is_staff() or id = (select role_id from public.profiles where id = auth.uid()));
create policy "staff read permissions" on public.permissions for select to authenticated using (public.is_staff());
create policy "staff read role_permissions" on public.role_permissions for select to authenticated using (public.is_staff());
create policy "super admin manages role_permissions" on public.role_permissions for all to authenticated
  using (public.current_role_key() = 'super_admin') with check (public.current_role_key() = 'super_admin');

-- profiles
create policy "read own or staff profiles" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "managers update profiles" on public.profiles for update to authenticated using (public.has_permission('users.manage')) with check (public.has_permission('users.manage'));

-- services (public read of enabled; staff read all)
create policy "public read services" on public.services for select using (is_enabled or public.is_staff());
create policy "manage services" on public.services for all to authenticated using (public.has_permission('services.manage')) with check (public.has_permission('services.manage'));
create policy "public read questions" on public.service_questions for select using (is_enabled or public.is_staff());
create policy "manage questions" on public.service_questions for all to authenticated using (public.has_permission('services.manage')) with check (public.has_permission('services.manage'));
create policy "public read options" on public.service_question_options for select using (true);
create policy "manage options" on public.service_question_options for all to authenticated using (public.has_permission('services.manage')) with check (public.has_permission('services.manage'));

-- leads & clients
create policy "view leads" on public.leads for select to authenticated using (public.has_permission('leads.view'));
create policy "manage leads" on public.leads for all to authenticated using (public.has_permission('leads.manage')) with check (public.has_permission('leads.manage'));
create policy "view clients" on public.clients for select to authenticated using (public.has_permission('leads.view'));
create policy "manage clients" on public.clients for all to authenticated using (public.has_permission('leads.manage')) with check (public.has_permission('leads.manage'));

-- consultations (inserts happen through the SECURITY DEFINER RPC)
create policy "view consultations" on public.consultations for select to authenticated using (public.has_permission('consultations.view'));
create policy "update consultations" on public.consultations for update to authenticated using (public.has_permission('consultations.manage')) with check (public.has_permission('consultations.manage'));
create policy "delete consultations" on public.consultations for delete to authenticated using (public.has_permission('consultations.delete'));

create policy "view answers" on public.consultation_answers for select to authenticated using (public.has_permission('consultations.view'));
create policy "view attachments" on public.consultation_attachments for select to authenticated using (public.has_permission('consultations.view'));
create policy "delete attachments" on public.consultation_attachments for delete to authenticated using (public.has_permission('consultations.delete'));

create policy "view notes" on public.consultation_notes for select to authenticated using (public.has_permission('consultations.view'));
create policy "add notes" on public.consultation_notes for insert to authenticated with check (public.has_permission('consultations.manage') and author_id = auth.uid());
create policy "delete notes" on public.consultation_notes for delete to authenticated using (author_id = auth.uid() or public.has_permission('consultations.delete'));

create policy "view activity" on public.consultation_activity for select to authenticated using (public.has_permission('consultations.view'));

-- notifications (shared team inbox; optional per-user recipient)
create policy "view notifications" on public.notifications for select to authenticated
  using (public.has_permission('notifications.view') and (recipient_id is null or recipient_id = auth.uid()));
create policy "mark notifications" on public.notifications for update to authenticated
  using (public.has_permission('notifications.view') and (recipient_id is null or recipient_id = auth.uid()))
  with check (public.has_permission('notifications.view'));

-- CMS
create policy "public read pages" on public.pages for select using (is_published or public.is_staff());
create policy "manage pages" on public.pages for all to authenticated using (public.has_permission('content.manage')) with check (public.has_permission('content.manage'));
create policy "public read sections" on public.page_sections for select using (is_enabled or public.is_staff());
create policy "manage sections" on public.page_sections for all to authenticated using (public.has_permission('content.manage')) with check (public.has_permission('content.manage'));
create policy "public read faqs" on public.faqs for select using (is_enabled or public.is_staff());
create policy "manage faqs" on public.faqs for all to authenticated using (public.has_permission('faq.manage')) with check (public.has_permission('faq.manage'));
create policy "public read posts" on public.blog_posts for select using (status = 'published' or public.is_staff());
create policy "manage posts" on public.blog_posts for all to authenticated using (public.has_permission('blog.manage')) with check (public.has_permission('blog.manage'));
create policy "public read media" on public.media for select using (true);
create policy "upload media" on public.media for insert to authenticated with check (public.has_permission('media.manage'));
create policy "update media" on public.media for update to authenticated using (public.has_permission('media.manage')) with check (public.has_permission('media.manage'));
create policy "delete media" on public.media for delete to authenticated using (public.has_permission('media.delete'));
create policy "public read settings" on public.site_settings for select using (true);
create policy "manage settings" on public.site_settings for all to authenticated using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));
create policy "public read seo" on public.seo_settings for select using (true);
create policy "manage seo" on public.seo_settings for all to authenticated using (public.has_permission('seo.manage')) with check (public.has_permission('seo.manage'));

-- audit logs (insert only via triggers / RPC)
create policy "view audit logs" on public.audit_logs for select to authenticated using (public.has_permission('audit.view'));

-- ---------------------------------------------------------------------
-- Storage buckets & policies
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('consultation-uploads', 'consultation-uploads', false, 10485760,
        array['application/pdf','image/jpeg','image/png','image/webp','image/gif',
              'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv',
              'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public upload consultation files" on storage.objects;
drop policy if exists "staff read consultation files" on storage.objects;
drop policy if exists "staff delete consultation files" on storage.objects;
drop policy if exists "public read media files" on storage.objects;
drop policy if exists "staff upload media files" on storage.objects;
drop policy if exists "staff update media files" on storage.objects;
drop policy if exists "staff delete media files" on storage.objects;

-- Uploads are only accepted into a folder named after an existing consultation
-- created within the last 24 hours (checked via a SECURITY DEFINER helper, as
-- anonymous visitors cannot read the consultations table).
create or replace function public.consultation_upload_allowed(p_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.consultations c
    where c.id::text = split_part(p_path, '/', 1)
      and c.created_at > now() - interval '24 hours'
      and (select count(*) from public.consultation_attachments a where a.consultation_id = c.id) < 10
  );
$$;
grant execute on function public.consultation_upload_allowed(text) to anon, authenticated;

create policy "public upload consultation files" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'consultation-uploads' and public.consultation_upload_allowed(name));
create policy "staff read consultation files" on storage.objects for select to authenticated
  using (bucket_id = 'consultation-uploads' and public.has_permission('consultations.view'));
create policy "staff delete consultation files" on storage.objects for delete to authenticated
  using (bucket_id = 'consultation-uploads' and public.has_permission('consultations.delete'));

create policy "public read media files" on storage.objects for select using (bucket_id = 'media');
create policy "staff upload media files" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_permission('media.manage'));
create policy "staff update media files" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_permission('media.manage'));
create policy "staff delete media files" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_permission('media.delete'));

-- ---------------------------------------------------------------------
-- Realtime (notification bell)
-- ---------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null; end $$;

-- ---------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------
insert into public.roles (key, name, description, is_system) values
  ('super_admin', 'Super Admin', 'Full access, including roles and permissions.', true),
  ('admin', 'Admin', 'Manages consultations, content, users and settings.', true),
  ('editor', 'Editor', 'Manages website content, services, FAQ, blog and media.', true),
  ('consultation_manager', 'Consultation Manager', 'Handles consultation requests, leads and clients.', true)
on conflict (key) do update set name = excluded.name, description = excluded.description;

insert into public.permissions (key, module, description) values
  ('dashboard.view', 'dashboard', 'View the dashboard'),
  ('consultations.view', 'consultations', 'View consultations and attachments'),
  ('consultations.manage', 'consultations', 'Update status, priority, assignment and notes'),
  ('consultations.delete', 'consultations', 'Delete consultations and attachments'),
  ('leads.view', 'leads', 'View leads and clients'),
  ('leads.manage', 'leads', 'Edit leads and convert to clients'),
  ('content.view', 'content', 'Open the website content module'),
  ('content.manage', 'content', 'Edit page sections'),
  ('services.manage', 'content', 'Create and edit services and questions'),
  ('faq.manage', 'content', 'Manage FAQ items'),
  ('blog.manage', 'content', 'Manage blog posts'),
  ('media.view', 'media', 'Browse the media library'),
  ('media.manage', 'media', 'Upload media'),
  ('media.delete', 'media', 'Delete media'),
  ('seo.manage', 'seo', 'Edit SEO settings'),
  ('settings.manage', 'settings', 'Edit business settings'),
  ('notifications.view', 'notifications', 'View notifications'),
  ('users.manage', 'users', 'Approve users and assign roles'),
  ('audit.view', 'audit', 'View activity logs')
on conflict (key) do update set module = excluded.module, description = excluded.description;

-- Default permission sets (only inserted when missing; super admin bypasses this table)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p where r.key = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key in
  ('dashboard.view','content.view','content.manage','services.manage','faq.manage','blog.manage','media.view','media.manage','seo.manage','notifications.view')
where r.key = 'editor'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key in
  ('dashboard.view','consultations.view','consultations.manage','leads.view','leads.manage','notifications.view','media.view')
where r.key = 'consultation_manager'
on conflict do nothing;

-- Services (content fields left null fall back to the website's built-in copy; edit them in the admin portal)
insert into public.services (slug, name, short_name, short_description, icon, features, cta_text, sort_order) values
  ('accounting', 'Accounting Services', 'Accounting',
   'Professional accounting support to help maintain accurate financial records and improve financial clarity.',
   'Calculator', '["Bookkeeping","Financial records","Accounts preparation","Financial reporting","Business accounting support"]'::jsonb,
   'Discuss Your Accounting Needs', 1),
  ('auditing-financial', 'Auditing & Financial Services', 'Auditing & Financial',
   'Structured financial and auditing support to help businesses maintain better financial visibility and control.',
   'FileSearch', '["Audit support","Financial review","Financial analysis","Documentation support","Compliance-oriented assistance"]'::jsonb,
   'Request Financial Support', 2),
  ('business-registration', 'Business Registration', 'Business Registration',
   'Guidance and support for setting up and registering your business with a professional approach.',
   'Building2', '["Business registration guidance","Company documentation","Registration support","Business setup consultation","Documentation assistance"]'::jsonb,
   'Start Your Business Journey', 3),
  ('business-consulting', 'Business Consulting', 'Business Consulting',
   'Practical business consultation to help organizations make informed decisions and improve operations.',
   'Briefcase', '["Business planning","Business process improvement","Financial planning support","Operational consultation","Business growth guidance"]'::jsonb,
   'Book a Consultation', 4),
  ('it-solutions', 'IT Solutions', 'IT Solutions',
   'Technology solutions that help businesses modernize, automate and operate more efficiently.',
   'MonitorSmartphone', '["Business websites","Business software","IT consultation","Digital solutions","Process automation"]'::jsonb,
   'Discuss Your IT Requirement', 5)
on conflict (slug) do nothing;

-- CMS pages
insert into public.pages (slug, title) values
  ('home', 'Homepage'), ('about', 'About Us'), ('services', 'Services'), ('why-choose-us', 'Why Choose Us'),
  ('faq', 'FAQ'), ('contact', 'Contact'), ('blog', 'Insights'), ('consultation', 'Consultation Form')
on conflict (slug) do nothing;

-- FAQs
insert into public.faqs (question, answer, sort_order)
select * from (values
  ('What services does TV Clarity Capital provide?', 'TV Clarity Capital (Pvt) Ltd provides accounting services, auditing and financial services, business registration guidance, business consulting and IT solutions. Our aim is to give individuals and businesses clear, practical and professional support across finance, business and technology.', 1),
  ('Do you provide accounting support for small businesses?', 'Yes. Small businesses, entrepreneurs and startups are an important part of who we support. Our accounting services include bookkeeping, maintaining financial records, accounts preparation, financial reporting and ongoing business accounting support, structured around the size and needs of your business.', 2),
  ('Can you help with business registration?', 'Yes. We provide guidance and assistance throughout the business registration and setup process, including explaining the steps involved, helping you organize and prepare documentation, and consulting on how to set up your business properly from the start. Registration decisions and approvals remain with the relevant authorities.', 3),
  ('Do you provide business consulting?', 'Yes. Our business consulting covers business planning, process improvement, operational guidance, financial planning support, growth strategy and decision support. We follow a practical consultation journey: discuss, analyze, recommend, implement and review.', 4),
  ('Do you provide IT solutions?', 'Yes. We support businesses with practical IT and digital solutions such as business websites, web applications, business software, ERP/POS and CRM solutions, process automation, IT consultation and digital transformation guidance.', 5),
  ('How can I request a consultation?', 'Message us on WhatsApp on 076 430 3421 (Fastest response), call us on 071 405 3449, email tvclaritycapital@gmail.com, or use the consultation form on our website.', 6),
  ('Where is TV Clarity Capital located?', 'TV Clarity Capital (Pvt) Ltd is based in Monaragala, Sri Lanka. We serve clients across Sri Lanka by phone, WhatsApp, email, and direct consultation.', 7),
  ('How can I contact you?', 'WhatsApp us on 076 430 3421 for instant support, call 071 405 3449, email tvclaritycapital@gmail.com, or submit an inquiry through our Contact page.', 8)
) as seed(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- Business settings
insert into public.site_settings (key, value) values
  ('company_name', 'TV Clarity Capital (Pvt) Ltd'),
  ('short_name', 'TV Clarity Capital'),
  ('tagline', 'Our Capital is Your Success'),
  ('phone_display', '071 405 3449'),
  ('phone_e164', '+94714053449'),
  ('whatsapp_number', '94764303421'),
  ('location', 'Monaragala, Sri Lanka'),
  ('address', 'Monaragala, Sri Lanka'),
  ('facebook_url', 'https://www.facebook.com/share/1Gr2TQKFwW/'),
  ('email', 'tvclaritycapital@gmail.com'),
  ('business_hours', 'Monday – Saturday: 8:30 AM – 5:30 PM')
on conflict (key) do nothing;

-- Global SEO row
insert into public.seo_settings (page_path, title, description)
values ('global', 'TV Clarity Capital (Pvt) Ltd | Accounting, Auditing, Business Registration & IT Solutions in Monaragala',
        'TV Clarity Capital (Pvt) Ltd provides accounting, auditing, business registration, business consulting and IT solutions in Monaragala, Sri Lanka.')
on conflict (page_path) do nothing;

-- =====================================================================
-- Done. Next: set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, rebuild,
-- open /admin/login and create the first account (becomes Super Admin).
-- =====================================================================
