/* Row types mirroring supabase/schema.sql */

export type ConsultationStatus =
  | "new"
  | "under_review"
  | "contacted"
  | "consultation_scheduled"
  | "proposal_sent"
  | "converted"
  | "completed"
  | "cancelled";
export type ConsultationPriority = "low" | "medium" | "high" | "urgent";
export type ContactMethod = "phone" | "whatsapp" | "email";
export type PostStatus = "draft" | "published" | "archived";
export type LeadStatus = "new" | "active" | "converted" | "lost";
export type QuestionType = "text" | "textarea" | "select" | "radio" | "multiselect";
export type MediaKind = "logo" | "favicon" | "image" | "blog" | "document";
export type ActivityType =
  | "created"
  | "status_changed"
  | "priority_changed"
  | "assigned"
  | "note_added"
  | "attachment_uploaded"
  | "updated";

export interface RoleRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface PermissionRow {
  id: string;
  key: string;
  module: string;
  description: string | null;
}

export interface RolePermissionRow {
  role_id: string;
  permission_id: string;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  role?: RoleRow | null;
}

export interface ConsultationRow {
  id: string;
  reference: string;
  service_id: string | null;
  service_slug: string;
  service_name: string;
  status: ConsultationStatus;
  priority: ConsultationPriority;
  client_name: string;
  business_name: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  preferred_contact: ContactMethod;
  preferred_date: string | null;
  preferred_time: string | null;
  preferred_timezone: string | null;
  summary: string | null;
  source: string;
  lead_id: string | null;
  assigned_to: string | null;
  follow_up_date: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationAnswerRow {
  id: string;
  consultation_id: string;
  question_key: string;
  question_label: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface ConsultationAttachmentRow {
  id: string;
  consultation_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ConsultationNoteRow {
  id: string;
  consultation_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface ConsultationActivityRow {
  id: string;
  consultation_id: string;
  actor_id: string | null;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadRow {
  id: string;
  full_name: string;
  business_name: string | null;
  phone: string;
  phone_normalized: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  lead_id: string | null;
  consultation_id: string | null;
  full_name: string;
  business_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  converted_at: string;
  created_at: string;
}

export interface ServiceSectionJson {
  title: string;
  description: string;
  icon?: string;
}
export interface ServiceAudienceJson {
  title: string;
  subtitle: string;
  items: string[];
}
export interface ServiceJourneyStepJson {
  step: string;
  description: string;
}

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  short_description: string | null;
  full_description: string | null;
  icon: string | null;
  features: string[] | null;
  cta_text: string | null;
  hero_title: string | null;
  hero_text: string | null;
  sections: ServiceSectionJson[] | null;
  audience: ServiceAudienceJson | null;
  journey: ServiceJourneyStepJson[] | null;
  disclaimer: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceQuestionRow {
  id: string;
  service_id: string;
  key: string;
  label: string;
  type: QuestionType;
  placeholder: string | null;
  help_text: string | null;
  is_required: boolean;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

export interface ServiceQuestionOptionRow {
  id: string;
  question_id: string;
  label: string;
  value: string;
  sort_order: number;
}

export type QuestionWithOptions = ServiceQuestionRow & { options?: ServiceQuestionOptionRow[] };

export interface PageRow {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSectionRow {
  id: string;
  page_id: string;
  key: string;
  title: string | null;
  content: Record<string, unknown>;
  is_enabled: boolean;
  sort_order: number;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  status: PostStatus;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaRow {
  id: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: MediaKind;
  alt_text: string | null;
  public_url: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface SeoSettingRow {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
  robots: string | null;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  recipient_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}
