import { useState, type FormEvent, type ReactNode } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { site } from "@/data/site";
import {
  buildWhatsAppInquiryLink,
  serviceOptions,
  submitInquiry,
  validateInquiry,
  type InquiryErrors,
  type InquiryPayload,
} from "@/lib/inquiry";
import { cn } from "@/utils/cn";

const emptyValues: InquiryPayload = {
  fullName: "",
  phone: "",
  email: "",
  service: "",
  message: "",
};

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 transition-colors",
    "focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/15",
    invalid ? "border-red-400 bg-red-50/40" : "border-line hover:border-navy/30",
  );

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormProps = { defaultService?: string; className?: string };

export function ContactForm({ defaultService = "", className }: ContactFormProps) {
  const [values, setValues] = useState<InquiryPayload>({ ...emptyValues, service: defaultService });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof InquiryPayload, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitted, setSubmitted] = useState<InquiryPayload | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const update = (field: keyof InquiryPayload, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      setErrors(validateInquiry(next));
    }
  };

  const blur = (field: keyof InquiryPayload) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateInquiry(values));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateInquiry(values);
    setErrors(validation);
    setTouched({ fullName: true, phone: true, email: true, service: true, message: true });
    if (Object.keys(validation).length > 0) {
      const firstInvalid = Object.keys(validation)[0];
      document.getElementById(`inquiry-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const outcome = await submitInquiry(values);
      setReference(outcome.reference ?? null);
      setSubmitted(values);
      setStatus("success");
      setValues({ ...emptyValues, service: defaultService });
      setTouched({});
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" && submitted) {
    return (
      <div
        className={cn("card p-8 text-center sm:p-10", className)}
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
          <CircleCheck className="h-9 w-9" strokeWidth={1.8} />
        </span>
        <h3 className="mt-6 text-2xl font-bold text-ink">Thank you, {submitted.fullName.split(" ")[0]}!</h3>
        {reference && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-navy">
            Reference: {reference}
          </p>
        )}
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Your inquiry about <span className="font-semibold text-ink">{submitted.service}</span> has been
          submitted. We will get back to you as soon as possible. For the fastest response, you can also send
          the same details to us on WhatsApp or call us directly.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href={buildWhatsAppInquiryLink(submitted)} variant="navy" className="bg-[#1f9d55] hover:bg-[#178a49]">
            <WhatsAppIcon className="h-4.5 w-4.5" /> Send via WhatsApp
          </Button>
          <Button href={site.phoneHref} variant="outline">
            <Phone className="h-4 w-4" /> Call {site.phoneDisplay}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-royal hover:text-navy"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  const fieldError = (field: keyof InquiryPayload) => (touched[field] ? errors[field] : undefined);

  return (
    <form className={cn("card p-6 sm:p-8", className)} onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="inquiry-fullName" label="Full Name" required error={fieldError("fullName")}>
          <input
            id="inquiry-fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            onBlur={() => blur("fullName")}
            className={inputClass(Boolean(fieldError("fullName")))}
            aria-invalid={Boolean(fieldError("fullName"))}
            aria-describedby={fieldError("fullName") ? "inquiry-fullName-error" : undefined}
            required
          />
        </Field>
        <Field id="inquiry-phone" label="Phone Number" required error={fieldError("phone")}>
          <input
            id="inquiry-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="07X XXX XXXX"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => blur("phone")}
            className={inputClass(Boolean(fieldError("phone")))}
            aria-invalid={Boolean(fieldError("phone"))}
            aria-describedby={fieldError("phone") ? "inquiry-phone-error" : undefined}
            required
          />
        </Field>
        <Field id="inquiry-email" label="Email" hint="Optional" error={fieldError("email")}>
          <input
            id="inquiry-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            className={inputClass(Boolean(fieldError("email")))}
            aria-invalid={Boolean(fieldError("email"))}
            aria-describedby={fieldError("email") ? "inquiry-email-error" : undefined}
          />
        </Field>
        <Field id="inquiry-service" label="Service Required" required error={fieldError("service")}>
          <select
            id="inquiry-service"
            name="service"
            value={values.service}
            onChange={(e) => update("service", e.target.value)}
            onBlur={() => blur("service")}
            className={cn(inputClass(Boolean(fieldError("service"))), "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23062B52%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat pr-10")}
            aria-invalid={Boolean(fieldError("service"))}
            aria-describedby={fieldError("service") ? "inquiry-service-error" : undefined}
            required
          >
            <option value="">Select a service</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field id="inquiry-message" label="Message" required error={fieldError("message")}>
            <textarea
              id="inquiry-message"
              name="message"
              rows={5}
              placeholder="Briefly describe your requirement..."
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              onBlur={() => blur("message")}
              className={cn(inputClass(Boolean(fieldError("message"))), "resize-y")}
              aria-invalid={Boolean(fieldError("message"))}
              aria-describedby={fieldError("message") ? "inquiry-message-error" : undefined}
              required
            />
          </Field>
        </div>
      </div>

      {status === "error" && (
        <p
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Something went wrong while sending your inquiry. Please try again, or contact us directly on{" "}
          <a href={site.phoneHref} className="font-semibold underline">
            {site.phoneDisplay}
          </a>
          .
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">
          Your details are used only to respond to your inquiry.
        </p>
        <Button type="submit" size="lg" disabled={status === "submitting"} className="sm:min-w-[180px]">
          {status === "submitting" ? (
            <>
              <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send Inquiry <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function Field({ id, label, required, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
        <span>
          {label}
          {required && (
            <span className="ml-1 text-gold-dark" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {hint && <span className="text-xs font-medium text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600" role="alert">
          <CircleAlert className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
