import { services } from "@/data/services";
import { site, whatsappWithMessage } from "@/data/site";
import { supabase } from "@/lib/supabase";

export type InquiryPayload = {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  message: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryPayload, string>>;

/** Options for the contact form's "Service Required" select (kept in sync with the CMS). */
export const serviceOptions: string[] = [
  ...services.map((service) => service.name),
  "General Inquiry / Not Sure Yet",
];

import { sanitizeText, validateInquirySchema } from "@/lib/security";

export function validateInquiry(values: InquiryPayload): InquiryErrors {
  const result = validateInquirySchema(values);
  return result.errors as InquiryErrors;
}

/**
 * Submits a general inquiry.
 *
 * 1. When Supabase is configured, the inquiry is recorded in the consultation
 *    CRM (as a "website contact form" consultation) so it appears in the admin
 *    portal with a reference number and notification.
 * 2. Otherwise, an optional JSON endpoint (VITE_INQUIRY_ENDPOINT) is used.
 * 3. Without either, the submission is handled on the client only and the
 *    visitor is offered WhatsApp/phone follow-up.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<{ delivered: boolean; reference?: string }> {
  if (supabase) {
    const matched = services.find((service) => service.name === payload.service);
    const { data, error } = await supabase.rpc("submit_consultation", {
      p: {
        service_slug: matched?.slug ?? "other",
        service_name: matched?.name ?? payload.service,
        client_name: sanitizeText(payload.fullName),
        phone: payload.phone.trim(),
        email: payload.email.trim() || null,
        preferred_contact: "phone",
        summary: sanitizeText(payload.message),
        source: "contact_form",
        answers: [{ key: "message", label: "Message", answer: sanitizeText(payload.message) }],
      },
    });
    if (error) throw new Error(error.message);
    const result = (data ?? {}) as { reference?: string };
    return { delivered: true, reference: result.reference };
  }

  const endpoint = import.meta.env.VITE_INQUIRY_ENDPOINT;
  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { delivered: false };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...payload,
      source: `${site.shortName} website`,
      submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Inquiry submission failed with status ${response.status}`);
  }
  return { delivered: true };
}

/** Builds a WhatsApp deep link pre-filled with the inquiry details. */
export function buildWhatsAppInquiryLink(payload: InquiryPayload) {
  const parts = [
    `Hello ${site.shortName}, I would like to make an inquiry.`,
    `Name: ${payload.fullName}`,
    `Phone: ${payload.phone}`,
    payload.email ? `Email: ${payload.email}` : null,
    `Service: ${payload.service}`,
    `Message: ${payload.message}`,
  ].filter(Boolean);
  return whatsappWithMessage(parts.join("\n"));
}
