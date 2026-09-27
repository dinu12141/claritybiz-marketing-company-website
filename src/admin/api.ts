import { STORAGE_BUCKETS, isSupabaseConfigured, requireSupabase } from "@/lib/supabase";
import { FILE_SECURITY, sanitizeFilename, validateUploadedFile } from "@/lib/security";
import type {
  AuditLogRow,
  BlogPostRow,
  ClientRow,
  ConsultationActivityRow,
  ConsultationAnswerRow,
  ConsultationAttachmentRow,
  ConsultationNoteRow,
  ConsultationPriority,
  ConsultationRow,
  ConsultationStatus,
  FaqRow,
  LeadRow,
  MediaKind,
  MediaRow,
  NotificationRow,
  PageRow,
  PageSectionRow,
  PermissionRow,
  ProfileRow,
  QuestionWithOptions,
  RolePermissionRow,
  RoleRow,
  SeoSettingRow,
  ServiceRow,
} from "@/lib/types";

const sb = () => requireSupabase();

type Result<T> = { data: T | null; error: { message: string } | null };

function unwrap<T>(result: Result<T>): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

const sanitizeSearch = (value: string) => value.replace(/[,()%]/g, " ").trim();

export const SAMPLE_DEMO_CONSULTATIONS: ConsultationRow[] = [
  {
    id: "demo-1",
    reference: "TVC-2026-00001",
    service_id: "s-1",
    service_name: "Accounting Services",
    service_slug: "accounting",
    client_name: "Kamal Perera",
    business_name: "Perera & Sons Trading",
    phone: "077 123 4567",
    whatsapp: "077 123 4567",
    email: "kamal@pereratrading.lk",
    city: "Monaragala",
    status: "new",
    priority: "high",
    assigned_to: "demo-admin",
    preferred_channel: "phone",
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_time_slot: "morning",
    summary: "Need ongoing monthly bookkeeping and tax filing for retail wholesale business.",
    notes_count: 1,
    attachments_count: 2,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "demo-2",
    reference: "TVC-2026-00002",
    service_id: "s-2",
    service_name: "Business Registration",
    service_slug: "business-registration",
    client_name: "Nimali Silva",
    business_name: "Ceylon Green Agro Pvt Ltd",
    phone: "071 987 6543",
    whatsapp: "071 987 6543",
    email: "nimali@ceylongreen.lk",
    city: "Buttala",
    status: "contacted",
    priority: "medium",
    assigned_to: "demo-admin",
    preferred_channel: "whatsapp",
    preferred_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    preferred_time_slot: "afternoon",
    summary: "Registering a new Private Limited company for agricultural export.",
    notes_count: 2,
    attachments_count: 1,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "demo-3",
    reference: "TVC-2026-00003",
    service_id: "s-3",
    service_name: "Auditing & Financial Services",
    service_slug: "auditing-financial-services",
    client_name: "Sunil Bandara",
    business_name: "Uva Logistics Services",
    phone: "075 555 1234",
    whatsapp: "075 555 1234",
    email: "sunil@uvalogistics.lk",
    city: "Wellawaya",
    status: "consultation_scheduled",
    priority: "high",
    scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    assigned_to: "demo-admin",
    preferred_channel: "in_person",
    preferred_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    preferred_time_slot: "morning",
    summary: "Annual financial statement audit and bank submission review.",
    notes_count: 3,
    attachments_count: 3,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "demo-4",
    reference: "TVC-2026-00004",
    service_id: "s-4",
    service_name: "IT Solutions",
    service_slug: "it-solutions",
    client_name: "Ruwan Jayasinghe",
    business_name: "Jayasinghe Super Center",
    phone: "070 444 8888",
    whatsapp: "070 444 8888",
    email: "ruwan@jayasinghe.lk",
    city: "Monaragala",
    status: "converted",
    priority: "medium",
    assigned_to: "demo-admin",
    preferred_channel: "in_person",
    preferred_date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
    preferred_time_slot: "afternoon",
    summary: "Point of Sale software and network cabling setup.",
    notes_count: 2,
    attachments_count: 0,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

/* ======================================================= consultations */

export type ConsultationSort = "created_desc" | "created_asc" | "updated_desc" | "priority_desc";

export type ConsultationListParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: ConsultationStatus | "";
  service?: string;
  priority?: ConsultationPriority | "";
  assigned?: string;
  sort?: ConsultationSort;
};

export async function listConsultations(params: ConsultationListParams): Promise<{ rows: ConsultationRow[]; total: number }> {
  if (!isSupabaseConfigured) {
    let rows = [...SAMPLE_DEMO_CONSULTATIONS];
    if (params.status) rows = rows.filter((r) => r.status === params.status);
    if (params.service) rows = rows.filter((r) => r.service_slug === params.service);
    if (params.priority) rows = rows.filter((r) => r.priority === params.priority);
    return { rows, total: rows.length };
  }
  const from = (params.page - 1) * params.pageSize;
  let query = sb().from("consultations").select("*", { count: "exact" });
  if (params.status) query = query.eq("status", params.status);
  if (params.service) query = query.eq("service_slug", params.service);
  if (params.priority) query = query.eq("priority", params.priority);
  if (params.assigned === "unassigned") query = query.is("assigned_to", null);
  else if (params.assigned) query = query.eq("assigned_to", params.assigned);
  const search = sanitizeSearch(params.search ?? "");
  if (search) {
    query = query.or(
      `client_name.ilike.%${search}%,business_name.ilike.%${search}%,reference.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }
  switch (params.sort) {
    case "created_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "updated_desc":
      query = query.order("updated_at", { ascending: false });
      break;
    case "priority_desc":
      query = query.order("priority", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  const { data, error, count } = await query.range(from, from + params.pageSize - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as ConsultationRow[], total: count ?? 0 };
}

export async function listAllConsultations(limit = 1000): Promise<ConsultationRow[]> {
  if (!isSupabaseConfigured) return SAMPLE_DEMO_CONSULTATIONS;
  return unwrap<ConsultationRow[]>(await sb().from("consultations").select("*").order("created_at", { ascending: false }).limit(limit));
}

export async function listConsultationsForMonth(monthStart: Date): Promise<ConsultationRow[]> {
  if (!isSupabaseConfigured) return SAMPLE_DEMO_CONSULTATIONS;
  const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const startDate = startIso.slice(0, 10);
  const endDate = endIso.slice(0, 10);
  return unwrap<ConsultationRow[]>(
    await sb()
      .from("consultations")
      .select("*")
      .or(
        `and(scheduled_at.gte.${startIso},scheduled_at.lt.${endIso}),and(preferred_date.gte.${startDate},preferred_date.lt.${endDate}),and(follow_up_date.gte.${startDate},follow_up_date.lt.${endDate})`,
      )
      .order("created_at", { ascending: false }),
  );
}

export async function getConsultation(id: string): Promise<ConsultationRow> {
  if (!isSupabaseConfigured) {
    return SAMPLE_DEMO_CONSULTATIONS.find((c) => c.id === id) || SAMPLE_DEMO_CONSULTATIONS[0];
  }
  return unwrap<ConsultationRow>(await sb().from("consultations").select("*").eq("id", id).single());
}

export type ConsultationBundle = {
  consultation: ConsultationRow;
  answers: ConsultationAnswerRow[];
  attachments: ConsultationAttachmentRow[];
  notes: ConsultationNoteRow[];
  activity: ConsultationActivityRow[];
};

export async function getConsultationBundle(id: string): Promise<ConsultationBundle> {
  if (!isSupabaseConfigured) {
    const consultation = SAMPLE_DEMO_CONSULTATIONS.find((c) => c.id === id) || SAMPLE_DEMO_CONSULTATIONS[0];
    return {
      consultation,
      answers: [],
      attachments: [],
      notes: [],
      activity: [
        {
          id: "demo-act-1",
          consultation_id: consultation.id,
          actor_id: null,
          actor_name: "Client via Online Portal",
          action: "status_changed",
          description: "Consultation submitted via web form",
          created_at: consultation.created_at,
        },
      ],
    };
  }
  const client = sb();
  const [consultation, answers, attachments, notes, activity] = await Promise.all([
    client.from("consultations").select("*").eq("id", id).single(),
    client.from("consultation_answers").select("*").eq("consultation_id", id).order("sort_order"),
    client.from("consultation_attachments").select("*").eq("consultation_id", id).order("created_at"),
    client.from("consultation_notes").select("*").eq("consultation_id", id).order("created_at", { ascending: false }),
    client.from("consultation_activity").select("*").eq("consultation_id", id).order("created_at", { ascending: false }),
  ]);
  return {
    consultation: unwrap<ConsultationRow>(consultation),
    answers: unwrap<ConsultationAnswerRow[]>(answers),
    attachments: unwrap<ConsultationAttachmentRow[]>(attachments),
    notes: unwrap<ConsultationNoteRow[]>(notes),
    activity: unwrap<ConsultationActivityRow[]>(activity),
  };
}

export type ConsultationPatch = Partial<
  Pick<ConsultationRow, "status" | "priority" | "assigned_to" | "follow_up_date" | "scheduled_at" | "summary" | "client_name" | "business_name" | "phone" | "whatsapp" | "email" | "city">
>;

export async function updateConsultation(id: string, patch: ConsultationPatch): Promise<ConsultationRow> {
  return unwrap<ConsultationRow>(await sb().from("consultations").update(patch).eq("id", id).select("*").single());
}

export async function bulkUpdateConsultations(ids: string[], patch: ConsultationPatch): Promise<void> {
  if (!ids.length) return;
  unwrap(await sb().from("consultations").update(patch).in("id", ids).select("id"));
}

export async function deleteConsultations(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await sb().from("consultations").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

export async function addNote(consultationId: string, body: string, authorId: string): Promise<ConsultationNoteRow> {
  return unwrap<ConsultationNoteRow>(
    await sb().from("consultation_notes").insert({ consultation_id: consultationId, body, author_id: authorId }).select("*").single(),
  );
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await sb().from("consultation_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type ManualConsultationInput = {
  service_slug: string;
  service_name: string;
  client_name: string;
  business_name?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  preferred_contact: "phone" | "whatsapp" | "email";
  summary?: string;
};

export async function createManualConsultation(input: ManualConsultationInput): Promise<{ id: string; reference: string }> {
  const { data, error } = await sb().rpc("submit_consultation", {
    p: { ...input, source: "manual", answers: input.summary ? [{ key: "summary", label: "Summary", answer: input.summary }] : [] },
  });
  if (error) throw new Error(error.message);
  return data as { id: string; reference: string };
}

export async function getAttachmentUrl(path: string): Promise<string> {
  const { data, error } = await sb().storage.from(STORAGE_BUCKETS.uploads).createSignedUrl(path, 60 * 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteAttachment(attachment: ConsultationAttachmentRow): Promise<void> {
  await sb().storage.from(STORAGE_BUCKETS.uploads).remove([attachment.storage_path]);
  const { error } = await sb().from("consultation_attachments").delete().eq("id", attachment.id);
  if (error) throw new Error(error.message);
}

/* ============================================================== staff */

export async function listStaff(): Promise<ProfileRow[]> {
  if (!isSupabaseConfigured) return listProfiles();
  return unwrap<ProfileRow[]>(await sb().from("profiles").select("*, role:roles(*)").eq("is_active", true).order("full_name"));
}

/* ============================================================== leads */

export async function listLeads(): Promise<LeadRow[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: "lead-1",
        full_name: "Kamal Perera",
        business_name: "Perera & Sons Trading",
        phone: "077 123 4567",
        whatsapp: "077 123 4567",
        email: "kamal@pereratrading.lk",
        city: "Monaragala",
        status: "active",
        source: "consultation_form",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
  return unwrap<LeadRow[]>(await sb().from("leads").select("*").order("created_at", { ascending: false }));
}

export async function updateLead(id: string, patch: Partial<LeadRow>): Promise<LeadRow> {
  if (!isSupabaseConfigured) return { id, ...patch } as LeadRow;
  return unwrap<LeadRow>(await sb().from("leads").update(patch).eq("id", id).select("*").single());
}

export async function listClients(): Promise<ClientRow[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: "client-1",
        lead_id: "lead-1",
        full_name: "Ruwan Jayasinghe",
        business_name: "Jayasinghe Super Center",
        phone: "070 444 8888",
        whatsapp: "070 444 8888",
        email: "ruwan@jayasinghe.lk",
        city: "Monaragala",
        status: "active",
        company_reg_number: "PV-123456",
        notes: "IT & Accounting client",
        converted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
  return unwrap<ClientRow[]>(await sb().from("clients").select("*").order("converted_at", { ascending: false }));
}

export async function createClientFromLead(lead: LeadRow): Promise<ClientRow> {
  if (!isSupabaseConfigured) {
    return {
      id: "client-new",
      lead_id: lead.id,
      full_name: lead.full_name,
      business_name: lead.business_name,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      email: lead.email,
      city: lead.city,
      status: "active",
      company_reg_number: null,
      notes: null,
      converted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  const client = unwrap<ClientRow>(
    await sb()
      .from("clients")
      .insert({
        lead_id: lead.id,
        full_name: lead.full_name,
        business_name: lead.business_name,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        city: lead.city,
      })
      .select("*")
      .single(),
  );
  await updateLead(lead.id, { status: "converted" });
  return client;
}

export async function consultationCountsByLead(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured) return { "lead-1": 1 };
  const rows = unwrap<{ lead_id: string | null }[]>(await sb().from("consultations").select("lead_id"));
  const counts: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.lead_id) counts[row.lead_id] = (counts[row.lead_id] ?? 0) + 1;
  });
  return counts;
}

/* ================================================================ CMS */

export async function listPages(): Promise<PageRow[]> {
  return unwrap<PageRow[]>(await sb().from("pages").select("*").order("slug"));
}

export async function ensurePage(slug: string, title: string): Promise<PageRow> {
  const { data } = await sb().from("pages").select("*").eq("slug", slug).maybeSingle();
  if (data) return data as PageRow;
  return unwrap<PageRow>(await sb().from("pages").insert({ slug, title, is_published: true }).select("*").single());
}

export async function updatePage(id: string, patch: Partial<PageRow>): Promise<PageRow> {
  return unwrap<PageRow>(await sb().from("pages").update(patch).eq("id", id).select("*").single());
}

export async function listSections(pageId: string): Promise<PageSectionRow[]> {
  return unwrap<PageSectionRow[]>(await sb().from("page_sections").select("*").eq("page_id", pageId).order("sort_order"));
}

export async function upsertSection(input: {
  page_id: string;
  key: string;
  title: string;
  content: Record<string, unknown>;
  is_enabled: boolean;
  sort_order: number;
}): Promise<PageSectionRow> {
  return unwrap<PageSectionRow>(await sb().from("page_sections").upsert(input, { onConflict: "page_id,key" }).select("*").single());
}

/* ----------------------------------------------------------- services */

export async function listServicesAdmin(): Promise<ServiceRow[]> {
  return unwrap<ServiceRow[]>(await sb().from("services").select("*").order("sort_order"));
}

export async function getService(id: string): Promise<ServiceRow> {
  return unwrap<ServiceRow>(await sb().from("services").select("*").eq("id", id).single());
}

export type ServiceInput = Omit<ServiceRow, "id" | "created_at" | "updated_at">;

export async function createService(input: ServiceInput): Promise<ServiceRow> {
  return unwrap<ServiceRow>(await sb().from("services").insert(input).select("*").single());
}

export async function updateService(id: string, patch: Partial<ServiceInput>): Promise<ServiceRow> {
  return unwrap<ServiceRow>(await sb().from("services").update(patch).eq("id", id).select("*").single());
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await sb().from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderServices(orderedIds: string[]): Promise<void> {
  await Promise.all(orderedIds.map((id, index) => sb().from("services").update({ sort_order: index + 1 }).eq("id", id)));
}

export async function listQuestions(serviceId: string): Promise<QuestionWithOptions[]> {
  const rows = unwrap<QuestionWithOptions[]>(
    await sb().from("service_questions").select("*, options:service_question_options(*)").eq("service_id", serviceId).order("sort_order"),
  );
  return rows.map((row) => ({ ...row, options: (row.options ?? []).slice().sort((a, b) => a.sort_order - b.sort_order) }));
}

export type QuestionInput = {
  id?: string;
  service_id: string;
  key: string;
  label: string;
  type: QuestionWithOptions["type"];
  placeholder: string | null;
  help_text: string | null;
  is_required: boolean;
  is_enabled: boolean;
  sort_order: number;
  options: string[];
};

export async function saveQuestion(input: QuestionInput): Promise<void> {
  const { options, id, ...fields } = input;
  let questionId = id;
  if (questionId) {
    unwrap(await sb().from("service_questions").update(fields).eq("id", questionId).select("id").single());
    const { error } = await sb().from("service_question_options").delete().eq("question_id", questionId);
    if (error) throw new Error(error.message);
  } else {
    const created = unwrap<{ id: string }>(await sb().from("service_questions").insert(fields).select("id").single());
    questionId = created.id;
  }
  const needsOptions = ["select", "radio", "multiselect"].includes(fields.type);
  if (needsOptions && options.length) {
    const { error } = await sb()
      .from("service_question_options")
      .insert(options.map((label, index) => ({ question_id: questionId, label, value: label, sort_order: index + 1 })));
    if (error) throw new Error(error.message);
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await sb().from("service_questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------------------------------------------------------- FAQ */

export async function listFaqsAdmin(): Promise<FaqRow[]> {
  return unwrap<FaqRow[]>(await sb().from("faqs").select("*").order("sort_order"));
}

export async function createFaq(input: { question: string; answer: string; sort_order: number; is_enabled: boolean }): Promise<FaqRow> {
  return unwrap<FaqRow>(await sb().from("faqs").insert(input).select("*").single());
}

export async function updateFaq(id: string, patch: Partial<FaqRow>): Promise<FaqRow> {
  return unwrap<FaqRow>(await sb().from("faqs").update(patch).eq("id", id).select("*").single());
}

export async function deleteFaq(id: string): Promise<void> {
  const { error } = await sb().from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderFaqs(orderedIds: string[]): Promise<void> {
  await Promise.all(orderedIds.map((id, index) => sb().from("faqs").update({ sort_order: index + 1 }).eq("id", id)));
}

/* --------------------------------------------------------------- blog */

export async function listPosts(): Promise<BlogPostRow[]> {
  return unwrap<BlogPostRow[]>(await sb().from("blog_posts").select("*").order("created_at", { ascending: false }));
}

export async function getPost(id: string): Promise<BlogPostRow> {
  return unwrap<BlogPostRow>(await sb().from("blog_posts").select("*").eq("id", id).single());
}

export type PostInput = Omit<BlogPostRow, "id" | "created_at" | "updated_at" | "created_by">;

export async function createPost(input: PostInput, userId: string): Promise<BlogPostRow> {
  return unwrap<BlogPostRow>(await sb().from("blog_posts").insert({ ...input, created_by: userId }).select("*").single());
}

export async function updatePost(id: string, patch: Partial<PostInput>): Promise<BlogPostRow> {
  return unwrap<BlogPostRow>(await sb().from("blog_posts").update(patch).eq("id", id).select("*").single());
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await sb().from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------- media */

export async function listMedia(): Promise<MediaRow[]> {
  return unwrap<MediaRow[]>(await sb().from("media").select("*").order("created_at", { ascending: false }));
}

const safeName = (name: string) => sanitizeFilename(name).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-100);

export async function uploadMedia(file: File, kind: MediaKind, userId: string, altText?: string): Promise<MediaRow> {
  const securityCheck = validateUploadedFile(
    file,
    FILE_SECURITY.ALLOWED_MEDIA_EXTENSIONS,
    FILE_SECURITY.MAX_MEDIA_FILE_SIZE_BYTES
  );
  if (!securityCheck.valid) {
    throw new Error(securityCheck.error ?? "Invalid file format or size limit exceeded.");
  }

  const path = `${kind}/${Date.now()}-${safeName(file.name)}`;
  const storage = sb().storage.from(STORAGE_BUCKETS.media);
  const { error: uploadError } = await storage.upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const publicUrl = storage.getPublicUrl(path).data.publicUrl;
  return unwrap<MediaRow>(
    await sb()
      .from("media")
      .insert({
        bucket: STORAGE_BUCKETS.media,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        kind,
        alt_text: altText ?? null,
        public_url: publicUrl,
        uploaded_by: userId,
      })
      .select("*")
      .single(),
  );
}

export async function deleteMedia(item: MediaRow): Promise<void> {
  const { error: storageError } = await sb().storage.from(item.bucket).remove([item.storage_path]);
  if (storageError) throw new Error(storageError.message);
  const { error } = await sb().from("media").delete().eq("id", item.id);
  if (error) throw new Error(error.message);
}

/* ----------------------------------------------------------- settings */

export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = unwrap<{ key: string; value: string | null }[]>(await sb().from("site_settings").select("key, value"));
  const map: Record<string, string> = {};
  rows.forEach((row) => {
    map[row.key] = row.value ?? "";
  });
  return map;
}

export async function saveSiteSettings(values: Record<string, string>, userId: string): Promise<void> {
  const rows = Object.entries(values).map(([key, value]) => ({ key, value, updated_by: userId, updated_at: new Date().toISOString() }));
  const { error } = await sb().from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

/* ---------------------------------------------------------------- SEO */

export async function listSeo(): Promise<SeoSettingRow[]> {
  return unwrap<SeoSettingRow[]>(await sb().from("seo_settings").select("*").order("page_path"));
}

export async function upsertSeo(row: Partial<SeoSettingRow> & { page_path: string }): Promise<SeoSettingRow> {
  return unwrap<SeoSettingRow>(await sb().from("seo_settings").upsert(row, { onConflict: "page_path" }).select("*").single());
}

/* ------------------------------------------------------ notifications */

export async function listNotifications(limit = 50): Promise<NotificationRow[]> {
  return unwrap<NotificationRow[]>(await sb().from("notifications").select("*").order("created_at", { ascending: false }).limit(limit));
}

export async function unreadNotificationCount(): Promise<number> {
  const { count, error } = await sb().from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markNotificationRead(id: string, read = true): Promise<void> {
  const { error } = await sb().from("notifications").update({ is_read: read, read_at: read ? new Date().toISOString() : null }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await sb().from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("is_read", false);
  if (error) throw new Error(error.message);
}

export function subscribeToNotifications(onInsert: (row: NotificationRow) => void): () => void {
  if (!isSupabaseConfigured) return () => {};
  const client = sb();
  const channel = client
    .channel("admin-notifications")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
      onInsert(payload.new as NotificationRow);
    })
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

/* ------------------------------------------------------ users & roles */

export async function listProfiles(): Promise<ProfileRow[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: "demo-admin",
        full_name: "Super Administrator (Demo)",
        email: "admin@claritycapital.lk",
        phone: "+94714053449",
        is_active: true,
        role_id: "demo-role",
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: {
          id: "demo-role",
          name: "Super Admin",
          key: "super_admin",
          description: "Full system administration in demo mode",
          is_system: true,
          created_at: new Date().toISOString(),
        },
      },
    ];
  }
  return unwrap<ProfileRow[]>(await sb().from("profiles").select("*, role:roles(*)").order("created_at"));
}

export async function updateProfile(id: string, patch: Partial<Pick<ProfileRow, "full_name" | "role_id" | "is_active">>): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await sb().from("profiles").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listRoles(): Promise<RoleRow[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: "demo-role",
        name: "Super Admin",
        key: "super_admin",
        description: "Full system administration",
        is_system: true,
        created_at: new Date().toISOString(),
      },
    ];
  }
  return unwrap<RoleRow[]>(await sb().from("roles").select("*").order("name"));
}

export async function listPermissions(): Promise<PermissionRow[]> {
  if (!isSupabaseConfigured) return [];
  return unwrap<PermissionRow[]>(await sb().from("permissions").select("*").order("module").order("key"));
}

export async function listRolePermissions(): Promise<RolePermissionRow[]> {
  if (!isSupabaseConfigured) return [];
  return unwrap<RolePermissionRow[]>(await sb().from("role_permissions").select("*"));
}

export async function setRolePermission(roleId: string, permissionId: string, granted: boolean): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (granted) {
    const { error } = await sb().from("role_permissions").upsert({ role_id: roleId, permission_id: permissionId }, { onConflict: "role_id,permission_id" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb().from("role_permissions").delete().eq("role_id", roleId).eq("permission_id", permissionId);
    if (error) throw new Error(error.message);
  }
}

/* -------------------------------------------------------------- audit */

export async function listAuditLogs(params: { page: number; pageSize: number; action?: string; resource?: string }): Promise<{ rows: AuditLogRow[]; total: number }> {
  if (!isSupabaseConfigured) return { rows: [], total: 0 };
  const from = (params.page - 1) * params.pageSize;
  let query = sb().from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (params.action) query = query.eq("action", params.action);
  if (params.resource) query = query.eq("resource_type", params.resource);
  const { data, error, count } = await query.range(from, from + params.pageSize - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as AuditLogRow[], total: count ?? 0 };
}

export async function logAuthEvent(event: "login" | "logout"): Promise<void> {
  if (!isSupabaseConfigured) return;
  await sb().rpc("log_auth_event", { p_event: event });
}

export async function fetchDashboardData(): Promise<{ consultations: ConsultationRow[]; leadsCount: number; unread: number }> {
  if (!isSupabaseConfigured) {
    return {
      consultations: SAMPLE_DEMO_CONSULTATIONS,
      leadsCount: 4,
      unread: 1,
    };
  }
  const client = sb();
  const [consultations, leads, unread] = await Promise.all([
    client.from("consultations").select("*").order("created_at", { ascending: false }).limit(2000),
    client.from("leads").select("id", { count: "exact", head: true }),
    client.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  return {
    consultations: unwrap<ConsultationRow[]>(consultations),
    leadsCount: leads.count ?? 0,
    unread: unread.count ?? 0,
  };
}
