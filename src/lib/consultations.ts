import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_FILES, MAX_UPLOAD_SIZE, contactMethodLabel } from "@/data/consultation";
import { site, whatsappWithMessage } from "@/data/site";
import { STORAGE_BUCKETS, errorMessage, supabase } from "@/lib/supabase";
import type { ContactMethod } from "@/lib/types";
import { sanitizeFilename, validateUploadedFile } from "@/lib/security";

export type AnswerEntry = { key: string; label: string; answer: string };

export type ConsultationSubmission = {
  serviceSlug: string;
  serviceName: string;
  answers: AnswerEntry[];
  client: {
    fullName: string;
    businessName: string;
    phone: string;
    whatsapp: string;
    email: string;
    city: string;
  };
  contact: {
    method: ContactMethod;
    date: string;
    time: string;
    timezone: string;
  };
};

export type SubmissionResult = {
  reference: string;
  id: string | null;
  /** True when stored in the database; false when handled client-side only. */
  delivered: boolean;
  uploadWarnings: string[];
};

/** Validates a set of files against size, count, executable blocking, and type limits. Returns an error message or null. */
export function validateFiles(existing: File[], incoming: File[]): string | null {
  if (existing.length + incoming.length > MAX_UPLOAD_FILES) {
    return `You can attach up to ${MAX_UPLOAD_FILES} files.`;
  }
  for (const file of incoming) {
    // Strict security check: blocks executable files, scripts, double extensions & checks size
    const check = validateUploadedFile(file);
    if (!check.valid) {
      return check.error ?? `"${file.name}" is not permitted.`;
    }
    if (existing.some((item) => item.name === file.name && item.size === file.size)) {
      return `"${file.name}" has already been added.`;
    }
  }
  return null;
}

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const safeFileName = (name: string) => sanitizeFilename(name).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-120);

const provisionalReference = () =>
  `TVC-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 89999))}`;

/**
 * Submits a consultation request.
 * With Supabase: calls the `submit_consultation` RPC (server-side validation,
 * lead linking, reference generation, notification) and uploads attachments
 * to the private `consultation-uploads` bucket.
 */
export async function submitConsultation(data: ConsultationSubmission, files: File[]): Promise<SubmissionResult> {
  if (!supabase) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { reference: provisionalReference(), id: null, delivered: false, uploadWarnings: [] };
  }

  const { data: result, error } = await supabase.rpc("submit_consultation", {
    p: {
      service_slug: data.serviceSlug,
      service_name: data.serviceName,
      client_name: sanitizeText(data.client.fullName),
      business_name: data.client.businessName ? sanitizeText(data.client.businessName) : null,
      phone: data.client.phone.trim(),
      whatsapp: data.client.whatsapp ? data.client.whatsapp.trim() : null,
      email: data.client.email ? data.client.email.trim() : null,
      city: data.client.city ? sanitizeText(data.client.city) : null,
      preferred_contact: data.contact.method,
      preferred_date: data.contact.date || null,
      preferred_time: data.contact.time || null,
      preferred_timezone: data.contact.timezone || null,
      summary: sanitizeText(
        data.answers
          .filter((entry) => entry.answer)
          .map((entry) => `${entry.label}: ${entry.answer}`)
          .join("\n")
      ).slice(0, 4000),
      source: "website",
      answers: data.answers.map((a) => ({
        key: a.key,
        label: a.label,
        answer: sanitizeText(a.answer),
      })),
    },
  });
  if (error) throw new Error(error.message);

  const payload = (result ?? {}) as { id?: string; reference?: string; upload_token?: string };
  if (!payload.id || !payload.reference || !payload.upload_token) {
    throw new Error("The server did not return a consultation reference.");
  }

  const uploadWarnings: string[] = [];
  for (const file of files) {
    const path = `${payload.id}/${randomId()}-${safeFileName(file.name)}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.uploads)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error: attachError } = await supabase.rpc("attach_consultation_file", {
        p_consultation_id: payload.id,
        p_token: payload.upload_token,
        p_path: path,
        p_name: file.name,
        p_mime: file.type,
        p_size: file.size,
      });
      if (attachError) throw attachError;
    } catch (uploadIssue) {
      uploadWarnings.push(`${file.name}: ${errorMessage(uploadIssue, "upload failed")}`);
    }
  }

  return { reference: payload.reference, id: payload.id, delivered: true, uploadWarnings };
}

/** WhatsApp deep link containing the full request summary and reference. */
export function buildConsultationWhatsAppLink(data: ConsultationSubmission, reference: string) {
  const answerLines = data.answers.filter((entry) => entry.answer).map((entry) => `• ${entry.label}: ${entry.answer}`);
  const parts = [
    `Hello ${site.shortName}, I submitted a consultation request.`,
    `Reference: ${reference}`,
    `Service: ${data.serviceName}`,
    `Name: ${data.client.fullName}`,
    data.client.businessName ? `Business: ${data.client.businessName}` : null,
    `Phone: ${data.client.phone}`,
    `Preferred contact: ${contactMethodLabel(data.contact.method)}`,
    ...answerLines.slice(0, 8),
  ].filter(Boolean);
  return whatsappWithMessage(parts.join("\n"));
}
