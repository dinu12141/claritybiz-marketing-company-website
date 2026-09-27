import type { ConsultationPriority, ConsultationStatus, ContactMethod, QuestionType } from "@/lib/types";

export type Tone = "gray" | "blue" | "cyan" | "gold" | "amber" | "green" | "red" | "purple" | "navy";

export const CONSULTATION_STATUSES: { key: ConsultationStatus; label: string; tone: Tone; description: string }[] = [
  { key: "new", label: "New", tone: "cyan", description: "Just received, not yet reviewed." },
  { key: "under_review", label: "Under Review", tone: "amber", description: "Being assessed by the team." },
  { key: "contacted", label: "Contacted", tone: "blue", description: "Client has been contacted." },
  { key: "consultation_scheduled", label: "Consultation Scheduled", tone: "purple", description: "A consultation has been booked." },
  { key: "proposal_sent", label: "Proposal Sent", tone: "gold", description: "A proposal or quotation was shared." },
  { key: "converted", label: "Converted", tone: "green", description: "Client accepted and became a customer." },
  { key: "completed", label: "Completed", tone: "navy", description: "Engagement delivered and closed." },
  { key: "cancelled", label: "Cancelled", tone: "gray", description: "Request cancelled or not proceeding." },
];

export const statusMeta = (key: string) =>
  CONSULTATION_STATUSES.find((status) => status.key === key) ?? CONSULTATION_STATUSES[0];

export const PRIORITIES: { key: ConsultationPriority; label: string; tone: Tone }[] = [
  { key: "low", label: "Low", tone: "gray" },
  { key: "medium", label: "Medium", tone: "blue" },
  { key: "high", label: "High", tone: "amber" },
  { key: "urgent", label: "Urgent", tone: "red" },
];

export const priorityMeta = (key: string) => PRIORITIES.find((priority) => priority.key === key) ?? PRIORITIES[1];

export const CONTACT_METHODS: { key: ContactMethod; label: string; description: string }[] = [
  { key: "phone", label: "Phone", description: "We call you on your phone number." },
  { key: "whatsapp", label: "WhatsApp", description: "We message you on WhatsApp." },
  { key: "email", label: "Email", description: "We reply by email." },
];

export const contactMethodLabel = (key: string) => CONTACT_METHODS.find((method) => method.key === key)?.label ?? key;

/** Definition of a dynamic question shown in step 2 of the consultation form. */
export type QuestionDef = {
  key: string;
  label: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
};

export const OTHER_SERVICE = {
  slug: "other",
  name: "Other",
  shortName: "Other",
  description: "A requirement that does not fit the categories above, or a combination of services.",
} as const;

const BUSINESS_TYPES = [
  "Sole proprietorship",
  "Partnership",
  "Private limited company",
  "NGO / association",
  "Individual",
  "Other",
];

/** Default question sets per service slug. Editable per service from the admin portal. */
export const defaultQuestions: Record<string, QuestionDef[]> = {
  accounting: [
    { key: "business_type", label: "Business type", type: "select", options: BUSINESS_TYPES, required: true },
    { key: "business_status", label: "New or existing business", type: "radio", options: ["New business", "Existing business"], required: true },
    {
      key: "support_required",
      label: "Accounting support required",
      type: "multiselect",
      options: ["Bookkeeping", "Financial records", "Accounts preparation", "Financial reporting", "Ongoing accounting support", "Other"],
      required: true,
    },
    {
      key: "current_system",
      label: "Current accounting system",
      type: "select",
      options: ["None / manual records", "Spreadsheets (Excel)", "Accounting software", "Not sure"],
    },
    { key: "frequency", label: "Frequency of support", type: "select", options: ["One-time", "Monthly", "Quarterly", "Annually", "Not sure yet"] },
    { key: "additional", label: "Additional requirements", type: "textarea", placeholder: "Anything else we should know?" },
  ],
  "auditing-financial": [
    { key: "business_type", label: "Business type", type: "select", options: BUSINESS_TYPES, required: true },
    {
      key: "service_type",
      label: "Type of financial service required",
      type: "multiselect",
      options: ["Financial review", "Audit support", "Financial analysis", "Financial documentation", "Financial control support", "Business financial guidance"],
      required: true,
    },
    { key: "period_scope", label: "Period / scope", type: "text", placeholder: "e.g. Financial year 2025, last 6 months", required: true },
    {
      key: "documentation",
      label: "Existing documentation",
      type: "select",
      options: ["Complete and organized", "Partially available", "Minimal / needs preparation", "Not sure"],
    },
    { key: "additional", label: "Additional requirements", type: "textarea" },
  ],
  "business-registration": [
    { key: "entity_type", label: "Individual / Partnership / Company", type: "radio", options: ["Individual (sole proprietor)", "Partnership", "Company"], required: true },
    { key: "registration_status", label: "New registration / Existing business", type: "radio", options: ["New registration", "Existing business"], required: true },
    { key: "business_type", label: "Business type", type: "text", placeholder: "e.g. Retail shop, consultancy, agriculture", required: true },
    {
      key: "assistance",
      label: "Required registration assistance",
      type: "multiselect",
      options: ["Registration guidance", "Documentation support", "Setup consultation", "Process guidance", "Documentation preparation"],
      required: true,
    },
    { key: "additional", label: "Additional requirements", type: "textarea" },
  ],
  "business-consulting": [
    { key: "business_type", label: "Business type", type: "select", options: BUSINESS_TYPES, required: true },
    { key: "main_challenge", label: "Main business challenge", type: "textarea", required: true, placeholder: "Describe the challenge you would like help with" },
    {
      key: "consulting_area",
      label: "Consulting area",
      type: "multiselect",
      options: ["Business planning", "Process improvement", "Operational guidance", "Financial planning", "Growth strategy", "Decision support"],
      required: true,
    },
    { key: "business_stage", label: "Business stage", type: "select", options: ["Idea / pre-launch", "Startup (0–2 years)", "Growing", "Established", "Restructuring"] },
    { key: "expected_outcome", label: "Expected outcome", type: "textarea", placeholder: "What would a successful result look like?" },
    { key: "additional", label: "Additional requirements", type: "textarea" },
  ],
  "it-solutions": [
    {
      key: "solution_type",
      label: "Solution required",
      type: "multiselect",
      options: ["Website", "Web Application", "POS", "ERP", "CRM", "Business Automation", "IT Consultation", "Other"],
      required: true,
    },
    { key: "technology_requirement", label: "Technology requirement", type: "textarea", required: true, placeholder: "Describe what you need the solution to do" },
    { key: "current_system", label: "Current system", type: "select", options: ["None", "Manual / paper-based", "Spreadsheets", "Existing software", "Not sure"] },
    { key: "main_problem", label: "Main problem to solve", type: "textarea" },
    { key: "expected_outcome", label: "Expected outcome", type: "textarea" },
    {
      key: "budget_range",
      label: "Budget range (optional)",
      type: "select",
      options: ["Not sure yet", "Under LKR 100,000", "LKR 100,000 – 300,000", "LKR 300,000 – 1,000,000", "Above LKR 1,000,000", "Prefer to discuss"],
    },
    { key: "additional", label: "Additional requirements", type: "textarea" },
  ],
  other: [
    { key: "requirement", label: "Describe your requirement", type: "textarea", required: true, placeholder: "Tell us what you need help with" },
  ],
};

export const QUESTION_TYPES: { key: QuestionType; label: string }[] = [
  { key: "text", label: "Short text" },
  { key: "textarea", label: "Long text" },
  { key: "select", label: "Dropdown" },
  { key: "radio", label: "Single choice" },
  { key: "multiselect", label: "Multiple choice" },
];

export const MAX_UPLOAD_FILES = 5;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/gif": "GIF",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/csv": "CSV",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "text/plain": "TXT",
};

export const TIMEZONES = [
  "Asia/Colombo (GMT+5:30)",
  "Asia/Dubai (GMT+4)",
  "Asia/Singapore (GMT+8)",
  "Europe/London (GMT+0/+1)",
  "Europe/Berlin (GMT+1/+2)",
  "America/New_York (GMT-5/-4)",
  "Australia/Sydney (GMT+10/+11)",
  "Other",
];

export const TIME_SLOTS = ["Morning (9:00 – 12:00)", "Afternoon (12:00 – 15:00)", "Late afternoon (15:00 – 17:30)", "Flexible"];
