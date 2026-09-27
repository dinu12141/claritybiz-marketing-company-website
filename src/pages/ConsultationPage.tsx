import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  CloudUpload,
  Copy,
  FileText,
  LoaderCircle,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Puzzle,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { PageHero } from "@/components/sections/PageHero";
import { getContent, getQuestions, text } from "@/content/cms";
import {
  ALLOWED_UPLOAD_TYPES,
  CONTACT_METHODS,
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_SIZE,
  OTHER_SERVICE,
  TIMEZONES,
  TIME_SLOTS,
  contactMethodLabel,
  type QuestionDef,
} from "@/data/consultation";
import { images } from "@/data/images";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";
import {
  buildConsultationWhatsAppLink,
  submitConsultation,
  validateFiles,
  type AnswerEntry,
  type ConsultationSubmission,
  type SubmissionResult,
} from "@/lib/consultations";
import { isSupabaseConfigured, errorMessage } from "@/lib/supabase";
import type { ContactMethod } from "@/lib/types";
import { cn } from "@/utils/cn";

const STEPS = [
  { key: "service", title: "Select Service", description: "Choose the area you need help with." },
  { key: "questions", title: "Service Questions", description: "A few details so we can prepare properly." },
  { key: "client", title: "Client Details", description: "Tell us who we will be speaking with." },
  { key: "contact", title: "Preferred Contact", description: "How and when should we reach you?" },
  { key: "files", title: "Attachments", description: "Optionally share supporting documents." },
  { key: "review", title: "Review & Submit", description: "Check everything before sending." },
] as const;

type ClientState = { fullName: string; businessName: string; phone: string; whatsapp: string; email: string; city: string };
type ContactState = { method: ContactMethod | ""; date: string; time: string; timezone: string };
type AnswerValue = string | string[];

const PHONE_PATTERN = /^\+?[0-9\s\-()]{9,16}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 transition-colors hover:border-navy/30 focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/15";
const invalidClass = "border-red-400 bg-red-50/40";

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function ConsultationPage() {
  const [params] = useSearchParams();
  const requested = params.get("service") ?? "";

  useSeo({
    title: "Request a Consultation | TV Clarity Capital (Pvt) Ltd, Monaragala",
    description:
      "Request a consultation with TV Clarity Capital for accounting, auditing, business registration, business consulting or IT solutions. A short guided form with a reference number for follow-up.",
    path: "/consultation",
  });

  const serviceChoices = useMemo(
    () => [
      ...services.map((service) => ({
        slug: service.slug,
        name: service.name,
        description: service.description,
        icon: service.icon,
      })),
      { slug: OTHER_SERVICE.slug, name: OTHER_SERVICE.name, description: OTHER_SERVICE.description, icon: Puzzle },
    ],
    [],
  );

  const initialService =
    serviceChoices.find((choice) => choice.slug === requested || choice.name === requested)?.slug ?? "";

  const [step, setStep] = useState(0);
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [client, setClient] = useState<ClientState>({ fullName: "", businessName: "", phone: "", whatsapp: "", email: "", city: "" });
  const [contact, setContact] = useState<ContactState>({ method: "", date: "", time: "", timezone: TIMEZONES[0] });
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ submission: ConsultationSubmission; outcome: SubmissionResult } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedService = serviceChoices.find((choice) => choice.slug === serviceSlug) ?? null;
  const questions: QuestionDef[] = serviceSlug ? getQuestions(serviceSlug) : [];

  useEffect(() => {
    if (step > 0 && panelRef.current) {
      const top = panelRef.current.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [step]);

  /* ----------------------------------------------------------- validation */
  const validateStep = (index: number): Record<string, string> => {
    const next: Record<string, string> = {};
    if (index === 0 && !serviceSlug) next.service = "Please select a service to continue.";
    if (index === 1) {
      questions.forEach((question) => {
        if (!question.required) return;
        const value = answers[question.key];
        const empty = Array.isArray(value) ? value.length === 0 : !value || !String(value).trim();
        if (empty) next[question.key] = "This field is required.";
      });
    }
    if (index === 2) {
      if (client.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
      if (!PHONE_PATTERN.test(client.phone.trim())) next.phone = "Please enter a valid phone number.";
      if (client.whatsapp.trim() && !PHONE_PATTERN.test(client.whatsapp.trim())) next.whatsapp = "Please enter a valid WhatsApp number.";
      if (client.email.trim() && !EMAIL_PATTERN.test(client.email.trim())) next.email = "Please enter a valid email address.";
    }
    if (index === 3) {
      if (!contact.method) next.method = "Please choose how you would like to be contacted.";
      if (contact.method === "email" && !client.email.trim()) next.method = "Please add your email address in the previous step to be contacted by email.";
    }
    if (index === 5 && !confirmed) next.confirmed = "Please confirm that the information provided is accurate.";
    return next;
  };

  const goNext = () => {
    const validation = validateStep(step);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  const jumpTo = (index: number) => {
    if (index < step) {
      setErrors({});
      setStep(index);
    }
  };

  /* -------------------------------------------------------------- files */
  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const problem = validateFiles(files, list);
    if (problem) {
      setFileError(problem);
      return;
    }
    setFileError(null);
    setFiles((current) => [...current, ...list]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  };

  /* ------------------------------------------------------------- submit */
  const buildSubmission = (): ConsultationSubmission => {
    const answerEntries: AnswerEntry[] = questions.map((question) => {
      const value = answers[question.key];
      return { key: question.key, label: question.label, answer: Array.isArray(value) ? value.join(", ") : (value ?? "").toString().trim() };
    });
    return {
      serviceSlug,
      serviceName: selectedService?.name ?? "Other",
      answers: answerEntries,
      client,
      contact: { method: (contact.method || "phone") as ContactMethod, date: contact.date, time: contact.time, timezone: contact.timezone },
    };
  };

  const handleSubmit = async () => {
    const validation = validateStep(5);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setStatus("submitting");
    setSubmitError(null);
    const submission = buildSubmission();
    try {
      const outcome = await submitConsultation(submission, files);
      setResult({ submission, outcome });
      setStatus("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (issue) {
      setSubmitError(errorMessage(issue));
      setStatus("error");
    }
  };

  const successContent = getContent("consultation", "success");

  /* ------------------------------------------------------------- render */
  return (
    <>
      <PageHero
        eyebrow="Consultation Request"
        title="Tell Us About Your Requirement"
        text="Answer a few short questions and we will get back to you with clear, practical next steps. It takes about three minutes."
        crumbs={[{ label: "Consultation" }]}
        image={images.consulting}
        compact
      />

      <section className="relative overflow-hidden bg-light py-12 sm:py-16 lg:py-20" aria-label="Consultation form">
        <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative">
          {result ? (
            <SuccessPanel
              result={result}
              heading={text(successContent, "heading", "Your consultation request has been received.")}
              body={text(
                successContent,
                "text",
                "Thank you for reaching out. Please keep your reference number for future communication. We will contact you using your preferred method.",
              )}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
              {/* Stepper */}
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="card p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <LogoImage size={44} priority className="ring-2 ring-gold/60" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-royal">Consultation</p>
                      <p className="text-sm font-bold text-ink">
                        Step {step + 1} of {STEPS.length}
                      </p>
                    </div>
                  </div>
                  {/* Mobile progress bar */}
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-light lg:hidden">
                    <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                  </div>
                  <p className="text-sm font-semibold text-ink lg:hidden">{STEPS[step].title}</p>
                  <ol className="hidden space-y-1 lg:block">
                    {STEPS.map((item, index) => {
                      const done = index < step;
                      const active = index === step;
                      return (
                        <li key={item.key}>
                          <button
                            type="button"
                            onClick={() => jumpTo(index)}
                            disabled={index > step}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                              active && "bg-navy text-white",
                              done && "hover:bg-light",
                              index > step && "cursor-default opacity-60",
                            )}
                            aria-current={active ? "step" : undefined}
                          >
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                active ? "bg-gold text-navy" : done ? "bg-emerald-500 text-white" : "bg-light text-muted ring-1 ring-line",
                              )}
                            >
                              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
                            </span>
                            <span className={cn("text-sm font-semibold", active ? "text-white" : "text-ink")}>{item.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="gradient-navy on-dark mt-4 hidden rounded-2xl p-5 text-white lg:block">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">Prefer to talk?</p>
                  <a href={site.phoneHref} className="mt-2 flex items-center gap-2 text-sm font-semibold hover:text-gold">
                    <Phone className="h-4 w-4" /> {site.phoneDisplay}
                  </a>
                  <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-2 text-sm font-semibold hover:text-gold">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </aside>

              {/* Step panel */}
              <div ref={panelRef} className="card overflow-hidden">
                <div className="border-b border-line bg-white px-6 py-5 sm:px-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-royal">
                    Step {step + 1} · {STEPS[step].title}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-ink">{STEPS[step].title}</h2>
                  <p className="mt-1 text-sm text-muted">{STEPS[step].description}</p>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  {step === 0 && (
                    <div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {serviceChoices.map((choice) => {
                          const Icon = choice.icon;
                          const selected = choice.slug === serviceSlug;
                          return (
                            <button
                              key={choice.slug}
                              type="button"
                              onClick={() => {
                                setServiceSlug(choice.slug);
                                setAnswers({});
                                setErrors({});
                              }}
                              aria-pressed={selected}
                              className={cn(
                                "group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                                selected
                                  ? "border-gold bg-gold/10 ring-2 ring-gold/60"
                                  : "border-line bg-white hover:-translate-y-0.5 hover:border-royal/40 hover:shadow-card",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                  selected ? "bg-navy text-gold" : "bg-light text-royal group-hover:bg-navy group-hover:text-gold",
                                )}
                              >
                                <Icon className="h-5 w-5" strokeWidth={1.9} />
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center justify-between gap-2">
                                  <span className="text-[15px] font-bold text-ink">{choice.name}</span>
                                  {selected && <CircleCheck className="h-5 w-5 shrink-0 text-gold-dark" />}
                                </span>
                                <span className="mt-1 block text-[13px] leading-snug text-muted">{choice.description}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {errors.service && <FieldError message={errors.service} />}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      {selectedService && (
                        <div className="flex items-center gap-3 rounded-xl border border-line bg-light/70 px-4 py-3 text-sm">
                          <selectedService.icon className="h-4.5 w-4.5 text-royal" />
                          <span className="font-semibold text-ink">{selectedService.name}</span>
                          <button type="button" onClick={() => setStep(0)} className="ml-auto text-xs font-semibold text-royal hover:text-navy">
                            Change
                          </button>
                        </div>
                      )}
                      {questions.map((question) => (
                        <QuestionField
                          key={question.key}
                          question={question}
                          value={answers[question.key]}
                          error={errors[question.key]}
                          onChange={(value) => {
                            setAnswers((current) => ({ ...current, [question.key]: value }));
                            if (errors[question.key]) setErrors((current) => ({ ...current, [question.key]: "" }));
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField id="fullName" label="Full Name" required value={client.fullName} error={errors.fullName} autoComplete="name" onChange={(value) => setClient({ ...client, fullName: value })} />
                      <TextField id="businessName" label="Business / Company Name" value={client.businessName} autoComplete="organization" onChange={(value) => setClient({ ...client, businessName: value })} />
                      <TextField id="phone" label="Phone Number" required type="tel" value={client.phone} error={errors.phone} placeholder="07X XXX XXXX" autoComplete="tel" onChange={(value) => setClient({ ...client, phone: value })} />
                      <TextField id="whatsapp" label="WhatsApp Number" type="tel" value={client.whatsapp} error={errors.whatsapp} placeholder="Same as phone if blank" onChange={(value) => setClient({ ...client, whatsapp: value })} />
                      <TextField id="email" label="Email" type="email" value={client.email} error={errors.email} autoComplete="email" onChange={(value) => setClient({ ...client, email: value })} />
                      <TextField id="city" label="City / Location" value={client.city} placeholder="e.g. Monaragala" autoComplete="address-level2" onChange={(value) => setClient({ ...client, city: value })} />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-7">
                      <div>
                        <p className="mb-3 text-sm font-semibold text-ink">
                          Preferred contact method <span className="text-gold-dark">*</span>
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {CONTACT_METHODS.map((method) => {
                            const selected = contact.method === method.key;
                            const Icon = method.key === "phone" ? Phone : method.key === "email" ? Mail : MessageSquare;
                            return (
                              <button
                                key={method.key}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => {
                                  setContact({ ...contact, method: method.key });
                                  setErrors({});
                                }}
                                className={cn(
                                  "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                                  selected ? "border-gold bg-gold/10 ring-2 ring-gold/60" : "border-line bg-white hover:border-royal/40 hover:shadow-card",
                                )}
                              >
                                <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", selected ? "bg-navy text-gold" : "bg-light text-royal")}>
                                  {method.key === "whatsapp" ? <WhatsAppIcon className="h-4.5 w-4.5" /> : <Icon className="h-4.5 w-4.5" />}
                                </span>
                                <span className="text-sm font-bold text-ink">{method.label}</span>
                                <span className="text-xs text-muted">{method.description}</span>
                              </button>
                            );
                          })}
                        </div>
                        {errors.method && <FieldError message={errors.method} />}
                      </div>
                      <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                          <label htmlFor="preferred-date" className="mb-2 block text-sm font-semibold text-ink">
                            Preferred date <span className="text-xs font-medium text-muted">(optional)</span>
                          </label>
                          <input id="preferred-date" type="date" min={new Date().toISOString().slice(0, 10)} value={contact.date} onChange={(e) => setContact({ ...contact, date: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="preferred-time" className="mb-2 block text-sm font-semibold text-ink">
                            Preferred time <span className="text-xs font-medium text-muted">(optional)</span>
                          </label>
                          <select id="preferred-time" value={contact.time} onChange={(e) => setContact({ ...contact, time: e.target.value })} className={inputClass}>
                            <option value="">Any time</option>
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="preferred-timezone" className="mb-2 block text-sm font-semibold text-ink">
                            Timezone
                          </label>
                          <select id="preferred-timezone" value={contact.timezone} onChange={(e) => setContact({ ...contact, timezone: e.target.value })} className={inputClass}>
                            {TIMEZONES.map((zone) => (
                              <option key={zone} value={zone}>
                                {zone}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-5">
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={onDrop}
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-light/60 px-6 py-10 text-center transition-colors hover:border-royal/40"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-gold">
                          <CloudUpload className="h-7 w-7" strokeWidth={1.8} />
                        </span>
                        <p className="mt-4 text-base font-bold text-ink">Drag & drop files here</p>
                        <p className="mt-1 text-sm text-muted">
                          PDF, images, Excel, Word or text files · up to {MAX_UPLOAD_FILES} files · {Math.round(MAX_UPLOAD_SIZE / 1024 / 1024)} MB each
                        </p>
                        <label className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-blue">
                          <Paperclip className="h-4 w-4" /> Choose files
                          <input
                            type="file"
                            multiple
                            accept={Object.keys(ALLOWED_UPLOAD_TYPES).join(",")}
                            className="sr-only"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              if (event.target.files?.length) addFiles(event.target.files);
                              event.target.value = "";
                            }}
                          />
                        </label>
                        {!isSupabaseConfigured && (
                          <p className="mt-4 text-xs text-muted">File uploads will be enabled once the secure storage connection is configured. You can share documents with us on WhatsApp instead.</p>
                        )}
                      </div>
                      {fileError && <FieldError message={fileError} />}
                      {files.length > 0 && (
                        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                          {files.map((file) => (
                            <li key={`${file.name}-${file.size}`} className="flex items-center gap-3 bg-white px-4 py-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-light text-royal">
                                <FileText className="h-4.5 w-4.5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-ink">{file.name}</span>
                                <span className="text-xs text-muted">
                                  {ALLOWED_UPLOAD_TYPES[file.type] ?? "File"} · {formatBytes(file.size)}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setFiles(files.filter((item) => item !== file))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                                aria-label={`Remove ${file.name}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs leading-relaxed text-muted">Attachments are optional and stored privately. Only authorized staff can access them.</p>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-6">
                      <ReviewBlock title="Service" onEdit={() => setStep(0)}>
                        <SummaryRow label="Selected service" value={selectedService?.name ?? "—"} />
                      </ReviewBlock>
                      <ReviewBlock title="Requirement details" onEdit={() => setStep(1)}>
                        {questions.map((question) => {
                          const value = answers[question.key];
                          const display = Array.isArray(value) ? value.join(", ") : (value ?? "").toString();
                          return <SummaryRow key={question.key} label={question.label} value={display || "—"} />;
                        })}
                      </ReviewBlock>
                      <ReviewBlock title="Client details" onEdit={() => setStep(2)}>
                        <SummaryRow label="Full name" value={client.fullName} />
                        <SummaryRow label="Business" value={client.businessName || "—"} />
                        <SummaryRow label="Phone" value={client.phone} />
                        <SummaryRow label="WhatsApp" value={client.whatsapp || "—"} />
                        <SummaryRow label="Email" value={client.email || "—"} />
                        <SummaryRow label="City / Location" value={client.city || "—"} />
                      </ReviewBlock>
                      <ReviewBlock title="Preferred contact" onEdit={() => setStep(3)}>
                        <SummaryRow label="Method" value={contact.method ? contactMethodLabel(contact.method) : "—"} />
                        <SummaryRow label="Preferred date" value={contact.date || "Any"} />
                        <SummaryRow label="Preferred time" value={contact.time || "Any"} />
                        <SummaryRow label="Timezone" value={contact.timezone} />
                      </ReviewBlock>
                      <ReviewBlock title="Attachments" onEdit={() => setStep(4)}>
                        <SummaryRow label="Files" value={files.length ? files.map((file) => file.name).join(", ") : "None"} />
                      </ReviewBlock>
                      <label className="flex items-start gap-3 rounded-xl border border-line bg-light/60 px-4 py-3 text-sm text-ink">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={(event) => {
                            setConfirmed(event.target.checked);
                            setErrors({});
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-line text-navy focus:ring-royal"
                        />
                        <span>
                          I confirm the information provided is accurate and I agree to be contacted by {site.shortName} regarding this request. See our{" "}
                          <Link to="/privacy-policy" className="font-semibold text-royal underline-offset-2 hover:underline">
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>
                      {errors.confirmed && <FieldError message={errors.confirmed} />}
                      {submitError && (
                        <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                          {submitError} You can also contact us directly on{" "}
                          <a href={site.phoneHref} className="font-semibold underline">
                            {site.phoneDisplay}
                          </a>
                          .
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer navigation */}
                <div className="flex flex-col-reverse gap-3 border-t border-line bg-light/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0 || status === "submitting"}
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-navy disabled:invisible"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  {step < STEPS.length - 1 ? (
                    <Button onClick={goNext} size="md">
                      {step === 4 && files.length === 0 ? "Skip & Continue" : "Continue"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} size="lg" disabled={status === "submitting"}>
                      {status === "submitting" ? (
                        <>
                          <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> Submitting…
                        </>
                      ) : (
                        <>
                          Submit Consultation Request <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ pieces */

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600" role="alert">
      <CircleAlert className="h-3.5 w-3.5" /> {message}
    </p>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
};

function TextField({ id, label, value, onChange, required, type = "text", placeholder, autoComplete, error }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-gold-dark">*</span> : <span className="ml-1 text-xs font-medium text-muted">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, error && invalidClass)}
        aria-invalid={Boolean(error)}
        required={required}
      />
      {error && <FieldError message={error} />}
    </div>
  );
}

type QuestionFieldProps = {
  question: QuestionDef;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
};

function QuestionField({ question, value, error, onChange }: QuestionFieldProps) {
  const id = `q-${question.key}`;
  const label = (
    <span className="mb-2 block text-sm font-semibold text-ink">
      {question.label}
      {question.required ? <span className="ml-1 text-gold-dark">*</span> : <span className="ml-1 text-xs font-medium text-muted">(optional)</span>}
    </span>
  );

  if (question.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-ink">
          {question.label}
          {question.required && <span className="ml-1 text-gold-dark">*</span>}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(question.options ?? []).map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                  checked ? "border-gold bg-gold/10 font-semibold text-ink" : "border-line bg-white text-ink/85 hover:border-royal/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(checked ? selected.filter((item) => item !== option) : [...selected, option])}
                  className="h-4 w-4 rounded border-line text-navy focus:ring-royal"
                />
                {option}
              </label>
            );
          })}
        </div>
        {question.help && <p className="mt-2 text-xs text-muted">{question.help}</p>}
        {error && <FieldError message={error} />}
      </fieldset>
    );
  }

  if (question.type === "radio") {
    return (
      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-ink">
          {question.label}
          {question.required && <span className="ml-1 text-gold-dark">*</span>}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(question.options ?? []).map((option) => {
            const checked = value === option;
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                  checked ? "border-gold bg-gold/10 font-semibold text-ink" : "border-line bg-white text-ink/85 hover:border-royal/40",
                )}
              >
                <input type="radio" name={id} checked={checked} onChange={() => onChange(option)} className="h-4 w-4 border-line text-navy focus:ring-royal" />
                {option}
              </label>
            );
          })}
        </div>
        {error && <FieldError message={error} />}
      </fieldset>
    );
  }

  if (question.type === "select") {
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <select id={id} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} className={cn(inputClass, error && invalidClass)} aria-invalid={Boolean(error)}>
          <option value="">Select an option</option>
          {(question.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {question.help && <p className="mt-2 text-xs text-muted">{question.help}</p>}
        {error && <FieldError message={error} />}
      </div>
    );
  }

  if (question.type === "textarea") {
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <textarea id={id} rows={4} value={typeof value === "string" ? value : ""} placeholder={question.placeholder} onChange={(event) => onChange(event.target.value)} className={cn(inputClass, "resize-y", error && invalidClass)} aria-invalid={Boolean(error)} />
        {question.help && <p className="mt-2 text-xs text-muted">{question.help}</p>}
        {error && <FieldError message={error} />}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={typeof value === "string" ? value : ""} placeholder={question.placeholder} onChange={(event) => onChange(event.target.value)} className={cn(inputClass, error && invalidClass)} aria-invalid={Boolean(error)} />
      {question.help && <p className="mt-2 text-xs text-muted">{question.help}</p>}
      {error && <FieldError message={error} />}
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center justify-between bg-light/70 px-5 py-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-navy">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-royal hover:text-navy">
          Edit
        </button>
      </div>
      <dl className="divide-y divide-line">{children}</dl>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink break-words">{value}</dd>
    </div>
  );
}

function SuccessPanel({
  result,
  heading,
  body,
}: {
  result: { submission: ConsultationSubmission; outcome: SubmissionResult };
  heading: string;
  body: string;
}) {
  const [copied, setCopied] = useState(false);
  const { submission, outcome } = result;

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(outcome.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card overflow-hidden text-center">
        <div className="gradient-navy on-dark px-6 py-10 text-white sm:px-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy">
            <CircleCheck className="h-9 w-9" strokeWidth={2} />
          </span>
          <h2 className="mt-6 text-2xl font-extrabold sm:text-3xl">{heading}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{body}</p>
          <div className="mx-auto mt-6 inline-flex flex-col items-center gap-2 rounded-2xl border border-gold/40 bg-white/5 px-6 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Your reference number</span>
            <span className="font-display text-2xl font-extrabold tracking-wide text-white sm:text-3xl">{outcome.reference}</span>
            <button type="button" onClick={copyReference} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-gold">
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy reference"}
            </button>
          </div>
          {!outcome.delivered && (
            <p className="mx-auto mt-4 max-w-md text-xs text-white/60">
              This is a provisional reference. Please send your request to us on WhatsApp using the button below so we can confirm it.
            </p>
          )}
        </div>
        <div className="px-6 py-8 sm:px-10">
          <h3 className="text-lg font-bold text-ink">What happens next</h3>
          <ol className="mt-4 grid gap-3 text-left sm:grid-cols-3">
            {[
              { title: "We review your request", text: `Our team reviews the details for ${submission.serviceName}.` },
              { title: "We contact you", text: `We reach out by ${contactMethodLabel(submission.contact.method)}${submission.contact.date ? ` around ${submission.contact.date}` : ""}.` },
              { title: "We plan the next step", text: "Together we agree on a clear, practical way forward." },
            ].map((item, index) => (
              <li key={item.title} className="rounded-xl border border-line bg-light/60 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{index + 1}</span>
                <p className="mt-3 text-sm font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ol>
          {outcome.uploadWarnings.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
              <p className="font-semibold">Some attachments could not be uploaded:</p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {outcome.uploadWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs">You can share these files with us on WhatsApp, quoting your reference.</p>
            </div>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={buildConsultationWhatsAppLink(submission, outcome.reference)} variant="navy" className="bg-[#1f9d55] hover:bg-[#178a49]">
              <WhatsAppIcon className="h-4.5 w-4.5" /> Send summary on WhatsApp
            </Button>
            <Button href={site.phoneHref} variant="outline">
              <Phone className="h-4 w-4" /> Call {site.phoneDisplay}
            </Button>
            <Button to="/" variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
