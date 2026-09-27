# TV Clarity Capital — Platform Setup

The public website works out of the box with its built-in content. Connecting a
Supabase project enables the **admin portal** (`/admin`), the **CMS**, the
**consultation CRM**, authentication, file uploads and audit logging.

## 1. Create the Supabase project

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`
   and run it. The script is idempotent (safe to re-run) and creates:
   - tables, indexes and enums (`consultations`, `leads`, `clients`, `services`,
     `service_questions`, `pages`, `page_sections`, `faqs`, `blog_posts`,
     `media`, `site_settings`, `seo_settings`, `notifications`, `audit_logs`,
     `profiles`, `roles`, `permissions`, …)
   - Row Level Security policies for every table
   - the private `consultation-uploads` bucket and the public `media` bucket
     with storage policies
   - triggers (reference numbers `TVC-YYYY-NNNNN`, activity timeline,
     notifications, audit log, lead → client conversion)
   - the public RPCs `submit_consultation` and `attach_consultation_file`
   - seed roles, permissions, services, FAQs and settings
3. **Authentication → Providers → Email**: keep *Email* enabled. Decide whether
   to require email confirmation (recommended for production).
4. **Authentication → URL configuration**: add your website URL to the allowed
   redirect URLs.

## 2. Configure the frontend

Create a `.env` file (see `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Only the **anon** key is ever used in the browser — never the service-role key.
Rebuild (`npm run build`) and deploy.

## 3. Create the first administrator

Open `/admin/login` → **Request access** and create an account. The **first**
account automatically becomes the **Super Admin** (database trigger). Every
later account is created *inactive* without a role; a Super Admin/Admin
activates it and assigns a role in **Users & Roles**.

Roles (permissions are editable in the Roles & Permissions matrix):

| Role                 | Default access                                              |
| -------------------- | ----------------------------------------------------------- |
| Super Admin          | Everything, including role permissions                      |
| Admin                | All modules                                                 |
| Editor               | Website content, services, FAQ, blog, media, SEO            |
| Consultation Manager | Dashboard, consultations, leads/clients, notifications      |

## 4. How the public website uses the CMS

On load the website fetches `site_settings`, `services` (+ questions), `pages` /
`page_sections`, `faqs`, published `blog_posts` and `seo_settings` and overlays
them on the built-in defaults. Anything not set in the database falls back to
the built-in copy, so the site never breaks.

- **Settings** → phone, WhatsApp, email, address and social links update the
  header, footer, floating buttons, CTA bands and contact page.
- **Website Content** → homepage sections (hero, about, services heading, why
  cards, process steps, insights, CTA) and the hero of every inner page, with
  enable/disable switches.
- **Services** → cards, menus, footer links, service pages and the service list
  in the consultation form. Use an existing slug (e.g. `accounting`) to take
  over the built-in content; “Load built-in defaults” pre-fills the editor.
- **Consultation questions** → step 2 of the consultation form per service.
- **FAQ / Blog / SEO** → the FAQ page, Insights pages and meta tags.

Changes appear on the public website on the next page load.

## 5. Consultation workflow

`/consultation` is a six-step form (service → dynamic questions → client →
preferred contact → attachments → review). Submissions call the
`submit_consultation` RPC, which validates input server-side, links or creates
a **lead**, generates the reference number, records the activity timeline and
creates an admin **notification**. Attachments are uploaded to the private
bucket and registered with a one-time upload token. The general contact form
also lands in the CRM (source `contact_form`).

Staff manage requests in `/admin/consultations` (table, Kanban, calendar),
with status pipeline, priority, assignment, follow-up and scheduled dates,
internal notes, attachments (signed URLs) and the automatic activity timeline.
Marking a consultation **Converted** creates a **client** record.

## 6. Notification channels (email / WhatsApp / SMS)

The database already produces a `notifications` row (and a realtime event) for
every new consultation. To send external messages, add a **Database Webhook**
or an **Edge Function** on `INSERT` into `public.notifications` /
`public.consultations` and call your provider (Resend, Twilio, WhatsApp Cloud
API, …). Keep provider credentials in Supabase secrets / environment variables —
never in the frontend or in `site_settings`.

## 7. Security summary

- Every table has RLS enabled; permissions are checked in SQL via
  `has_permission()` — the UI only hides what the database already denies.
- Public visitors can only *insert* consultations through the validated RPC and
  upload into the private bucket; they can never read CRM data.
- Internal notes, attachments, activity and audit logs require staff
  permissions. Attachments are served through short-lived signed URLs.
- Role/status changes are guarded by a trigger (no self-promotion; only a
  Super Admin can grant Super Admin).
