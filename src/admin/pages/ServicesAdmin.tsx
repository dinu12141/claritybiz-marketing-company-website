import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Briefcase, ExternalLink, Images, ListChecks, Pencil, Plus, Save, Trash } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createService,
  deleteQuestion,
  deleteService,
  getService,
  listQuestions,
  listServicesAdmin,
  reorderServices,
  saveQuestion,
  updateService,
  type QuestionInput,
  type ServiceInput,
} from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Badge, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Select, Skeleton, Tabs, Textarea, Toggle, useToast } from "@/admin/components/ui";
import { MediaPickerModal } from "@/admin/pages/MediaPage";
import { slugify, useAsync } from "@/admin/utils";
import { staticServiceDefaults } from "@/content/cms";
import { QUESTION_TYPES, defaultQuestions, type QuestionDef } from "@/data/consultation";
import { iconByName, iconNames } from "@/lib/icons";
import { errorMessage } from "@/lib/supabase";
import type { QuestionType, QuestionWithOptions, ServiceRow } from "@/lib/types";

/* ============================================================== list */

export function ServicesAdminPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const query = useAsync(listServicesAdmin, []);
  const rows = query.data ?? [];
  const [toDelete, setToDelete] = useState<ServiceRow | null>(null);
  const [busy, setBusy] = useState(false);

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ordered = [...rows];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    try {
      await reorderServices(ordered.map((row) => row.id));
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Reorder failed", description: errorMessage(issue), tone: "error" });
    }
  };

  const toggle = async (row: ServiceRow) => {
    try {
      await updateService(row.id, { is_enabled: !row.is_enabled });
      toast({ title: row.is_enabled ? `${row.name} disabled` : `${row.name} enabled` });
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteService(toDelete.id);
      toast({ title: "Service deleted" });
      setToDelete(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Services"
        description="Create, edit, reorder and publish the services shown across the website and the consultation form."
        actions={
          <AdminButton icon={Plus} onClick={() => navigate("/admin/services/new")}>
            Add service
          </AdminButton>
        }
      />
      <Card padded={false}>
        {query.error ? (
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        ) : query.loading && !query.data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Briefcase} title="No services in the database yet" description="The website shows its built-in five services until you add services here. Add a service with one of the existing slugs to take over its content." action={<AdminButton icon={Plus} onClick={() => navigate("/admin/services/new")}>Add service</AdminButton>} />
        ) : (
          <ul className="divide-y divide-[#EEF3F8]">
            {rows.map((row, index) => {
              const Icon = iconByName(row.icon);
              return (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" className="text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => void move(index, -1)} disabled={index === 0} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" className="text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => void move(index, 1)} disabled={index === rows.length - 1} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/admin/services/${row.id}`} className="text-sm font-bold text-ink hover:text-royal">
                        {row.name}
                      </Link>
                      <Badge tone={row.is_enabled ? "green" : "gray"}>{row.is_enabled ? "Published" : "Disabled"}</Badge>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      /services/{row.slug} · {row.short_description ?? "No description"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Toggle size="sm" checked={row.is_enabled} onChange={() => void toggle(row)} />
                    <Link to={`/services/${row.slug}`} target="_blank" className="hidden sm:block">
                      <AdminButton variant="ghost" size="xs" icon={ExternalLink} aria-label="View" />
                    </Link>
                    <Link to={`/admin/services/${row.id}`}>
                      <AdminButton variant="ghost" size="xs" icon={Pencil} aria-label="Edit" />
                    </Link>
                    <AdminButton variant="ghost" size="xs" icon={Trash} onClick={() => setToDelete(row)} aria-label="Delete" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <ConfirmDialog open={Boolean(toDelete)} title="Delete service?" message={<p>“{toDelete?.name}” and its consultation questions will be removed. Existing consultations keep their service name.</p>} confirmLabel="Delete" loading={busy} onCancel={() => setToDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

/* ============================================================ editor */

type ServiceForm = {
  name: string;
  slug: string;
  short_name: string;
  short_description: string;
  full_description: string;
  icon: string;
  features: string;
  cta_text: string;
  hero_title: string;
  hero_text: string;
  sections: string;
  audience: string;
  journey: string;
  disclaimer: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  is_enabled: boolean;
  sort_order: number;
};

const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  short_name: "",
  short_description: "",
  full_description: "",
  icon: "Briefcase",
  features: "",
  cta_text: "Request a Consultation",
  hero_title: "",
  hero_text: "",
  sections: "[]",
  audience: "",
  journey: "",
  disclaimer: "",
  image_url: "",
  seo_title: "",
  seo_description: "",
  is_enabled: true,
  sort_order: 99,
};

const pretty = (value: unknown) => (value === null || value === undefined ? "" : JSON.stringify(value, null, 2));

function rowToForm(row: Partial<ServiceRow>, fallback: Partial<ServiceRow>): ServiceForm {
  const pick = <K extends keyof ServiceRow>(key: K) => (row[key] ?? fallback[key]) as ServiceRow[K] | undefined;
  return {
    name: pick("name") ?? "",
    slug: pick("slug") ?? "",
    short_name: pick("short_name") ?? "",
    short_description: pick("short_description") ?? "",
    full_description: pick("full_description") ?? "",
    icon: pick("icon") ?? "Briefcase",
    features: (pick("features") ?? []).join("\n"),
    cta_text: pick("cta_text") ?? "Request a Consultation",
    hero_title: pick("hero_title") ?? "",
    hero_text: pick("hero_text") ?? "",
    sections: pretty(pick("sections") ?? []),
    audience: pretty(pick("audience") ?? null),
    journey: pretty(pick("journey") ?? null),
    disclaimer: pick("disclaimer") ?? "",
    image_url: pick("image_url") ?? "",
    seo_title: pick("seo_title") ?? "",
    seo_description: pick("seo_description") ?? "",
    is_enabled: row.is_enabled ?? true,
    sort_order: row.sort_order ?? 99,
  };
}

function parseJson<T>(raw: string, label: string, expectArray: boolean): { value: T | null; error?: string } {
  if (!raw.trim()) return { value: null };
  try {
    const parsed = JSON.parse(raw);
    if (expectArray && !Array.isArray(parsed)) return { value: null, error: `${label} must be a JSON list.` };
    return { value: parsed as T };
  } catch {
    return { value: null, error: `${label} contains invalid JSON.` };
  }
}

export function ServiceEditorPage() {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const toast = useToast();
  const query = useAsync(async () => (isNew ? null : getService(id)), [id]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [tab, setTab] = useState("details");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    if (query.data) setForm(rowToForm(query.data, staticServiceDefaults(query.data.slug)));
  }, [query.data]);

  const update = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const loadDefaults = () => {
    const defaults = staticServiceDefaults(form.slug);
    if (!Object.keys(defaults).length) {
      toast({ title: "No built-in defaults for this slug", description: "Defaults exist for: accounting, auditing-financial, business-registration, business-consulting, it-solutions.", tone: "info" });
      return;
    }
    setForm(rowToForm({ is_enabled: form.is_enabled, sort_order: form.sort_order, image_url: form.image_url || undefined }, defaults));
    toast({ title: "Default content loaded", description: "Review and save to store it in the database." });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || form.slug.trim().length < 2) {
      setError("Name and slug are required.");
      return;
    }
    const sections = parseJson<ServiceRow["sections"]>(form.sections, "Sections", true);
    const audience = parseJson<ServiceRow["audience"]>(form.audience, "Audience", false);
    const journey = parseJson<ServiceRow["journey"]>(form.journey, "Journey", true);
    const problem = sections.error || audience.error || journey.error;
    if (problem) {
      setError(problem);
      setTab("content");
      return;
    }
    const input: ServiceInput = {
      name: form.name.trim(),
      slug: slugify(form.slug),
      short_name: form.short_name.trim() || null,
      short_description: form.short_description.trim() || null,
      full_description: form.full_description.trim() || null,
      icon: form.icon || null,
      features: form.features.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      cta_text: form.cta_text.trim() || null,
      hero_title: form.hero_title.trim() || null,
      hero_text: form.hero_text.trim() || null,
      sections: sections.value,
      audience: audience.value,
      journey: journey.value,
      disclaimer: form.disclaimer.trim() || null,
      image_url: form.image_url.trim() || null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      is_enabled: form.is_enabled,
      sort_order: form.sort_order,
    };
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await createService(input);
        toast({ title: "Service created" });
        navigate(`/admin/services/${created.id}`, { replace: true });
      } else {
        await updateService(id, input);
        toast({ title: "Service saved", description: "The public website updates on the next page load." });
        await query.refetch(true);
      }
    } catch (issue) {
      setError(errorMessage(issue));
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && query.error) {
    return (
      <Card padded={false}>
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      </Card>
    );
  }
  if (!isNew && query.loading && !query.data) {
    return <Skeleton className="h-96" />;
  }

  const IconPreview = iconByName(form.icon);

  return (
    <>
      <div className="mb-6">
        <Link to="/admin/services" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5" /> All services
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{isNew ? "New service" : form.name || "Edit service"}</h1>
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={loadDefaults}>
              Load built-in defaults
            </AdminButton>
            {!isNew && (
              <Link to={`/services/${form.slug}`} target="_blank">
                <AdminButton variant="secondary" icon={ExternalLink}>
                  View page
                </AdminButton>
              </Link>
            )}
            <AdminButton type="submit" form="service-form" icon={Save} loading={saving}>
              {isNew ? "Create service" : "Save changes"}
            </AdminButton>
          </div>
        </div>
      </div>

      <Tabs
        className="mb-4 w-fit"
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "details", label: "Details" },
          { key: "content", label: "Page content" },
          { key: "questions", label: "Consultation questions" },
          { key: "seo", label: "SEO" },
        ]}
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <form id="service-form" onSubmit={submit} className={tab === "questions" ? "hidden" : undefined}>
        {tab === "details" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="space-y-4 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Service name" htmlFor="s-name" required>
                  <Input
                    id="s-name"
                    value={form.name}
                    onChange={(event) => {
                      update("name", event.target.value);
                      if (!slugTouched) update("slug", slugify(event.target.value));
                    }}
                  />
                </Field>
                <Field label="Slug" htmlFor="s-slug" required hint="URL: /services/{slug}. Use an existing slug to take over built-in content.">
                  <Input
                    id="s-slug"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      update("slug", event.target.value);
                    }}
                  />
                </Field>
                <Field label="Short name" htmlFor="s-short" hint="Used in menus and footer.">
                  <Input id="s-short" value={form.short_name} onChange={(event) => update("short_name", event.target.value)} />
                </Field>
                <Field label="CTA text" htmlFor="s-cta">
                  <Input id="s-cta" value={form.cta_text} onChange={(event) => update("cta_text", event.target.value)} />
                </Field>
              </div>
              <Field label="Short description" htmlFor="s-desc" hint="Shown on cards and in menus.">
                <Textarea id="s-desc" rows={3} value={form.short_description} onChange={(event) => update("short_description", event.target.value)} />
              </Field>
              <Field label="Features" htmlFor="s-features" hint="One per line. Shown as bullet points on cards.">
                <Textarea id="s-features" rows={6} value={form.features} onChange={(event) => update("features", event.target.value)} />
              </Field>
            </Card>
            <div className="space-y-4">
              <Card className="space-y-4">
                <Field label="Status">
                  <Toggle checked={form.is_enabled} onChange={(value) => update("is_enabled", value)} label={form.is_enabled ? "Published" : "Disabled"} />
                </Field>
                <Field label="Sort order" htmlFor="s-order">
                  <Input id="s-order" type="number" value={form.sort_order} onChange={(event) => update("sort_order", Number(event.target.value))} />
                </Field>
                <Field label="Icon" htmlFor="s-icon">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                      <IconPreview className="h-5 w-5" />
                    </span>
                    <Select id="s-icon" value={form.icon} onChange={(event) => update("icon", event.target.value)}>
                      {iconNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </Field>
              </Card>
              <Card>
                <Field label="Featured image" htmlFor="s-image" hint="Leave empty to use the built-in image.">
                  {form.image_url && <img src={form.image_url} alt="" className="mb-2 aspect-video w-full rounded-lg object-cover" />}
                  <div className="flex gap-2">
                    <Input id="s-image" value={form.image_url} placeholder="https://…" onChange={(event) => update("image_url", event.target.value)} />
                    <AdminButton variant="secondary" icon={Images} onClick={() => setPickerOpen(true)} aria-label="Choose from media library" />
                  </div>
                </Field>
              </Card>
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-4">
            <Card className="space-y-4">
              <CardHeader title="Hero & introduction" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hero title" htmlFor="s-hero-title">
                  <Input id="s-hero-title" value={form.hero_title} onChange={(event) => update("hero_title", event.target.value)} />
                </Field>
                <Field label="Disclaimer" htmlFor="s-disclaimer" hint="Optional note shown under the introduction.">
                  <Input id="s-disclaimer" value={form.disclaimer} onChange={(event) => update("disclaimer", event.target.value)} />
                </Field>
              </div>
              <Field label="Hero text" htmlFor="s-hero-text">
                <Textarea id="s-hero-text" rows={3} value={form.hero_text} onChange={(event) => update("hero_text", event.target.value)} />
              </Field>
              <Field label="Full description" htmlFor="s-full" hint="Separate paragraphs with a blank line.">
                <Textarea id="s-full" rows={7} value={form.full_description} onChange={(event) => update("full_description", event.target.value)} />
              </Field>
            </Card>
            <Card className="space-y-4">
              <CardHeader title="Structured content (advanced)" description="JSON blocks rendered on the service page. Leave empty to use built-in defaults." />
              <Field label="Sections" htmlFor="s-sections" hint='List of { "title", "description", "icon" }. Icon names match the icon dropdown.'>
                <Textarea id="s-sections" rows={12} className="font-mono text-xs" value={form.sections} onChange={(event) => update("sections", event.target.value)} />
              </Field>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Audience" htmlFor="s-audience" hint='{ "title", "subtitle", "items": [] }'>
                  <Textarea id="s-audience" rows={8} className="font-mono text-xs" value={form.audience} onChange={(event) => update("audience", event.target.value)} />
                </Field>
                <Field label="Journey" htmlFor="s-journey" hint='List of { "step", "description" }'>
                  <Textarea id="s-journey" rows={8} className="font-mono text-xs" value={form.journey} onChange={(event) => update("journey", event.target.value)} />
                </Field>
              </div>
            </Card>
          </div>
        )}

        {tab === "seo" && (
          <Card className="space-y-4">
            <CardHeader title="Search engine settings" description="Used for the service page title, meta description and Open Graph tags." />
            <Field label="SEO title" htmlFor="s-seo-title">
              <Input id="s-seo-title" value={form.seo_title} onChange={(event) => update("seo_title", event.target.value)} />
            </Field>
            <Field label="SEO description" htmlFor="s-seo-desc" hint={`${form.seo_description.length}/160 characters recommended`}>
              <Textarea id="s-seo-desc" rows={3} value={form.seo_description} onChange={(event) => update("seo_description", event.target.value)} />
            </Field>
          </Card>
        )}
      </form>

      {tab === "questions" && (isNew ? <Card className="text-sm text-slate-500">Save the service first to configure its consultation questions.</Card> : <QuestionsManager serviceId={id} slug={form.slug} />)}

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => update("image_url", url)} />
    </>
  );
}

/* ========================================================== questions */

type QuestionDraft = { label: string; key: string; type: QuestionType; is_required: boolean; is_enabled: boolean; placeholder: string; help_text: string; options: string };

const emptyQuestion: QuestionDraft = { label: "", key: "", type: "text", is_required: false, is_enabled: true, placeholder: "", help_text: "", options: "" };

function QuestionsManager({ serviceId, slug }: { serviceId: string; slug: string }) {
  const toast = useToast();
  const { can } = useAuth();
  const query = useAsync(() => listQuestions(serviceId), [serviceId]);
  const rows = query.data ?? [];
  const [editing, setEditing] = useState<QuestionWithOptions | "new" | null>(null);
  const [draft, setDraft] = useState<QuestionDraft>(emptyQuestion);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<QuestionWithOptions | null>(null);
  const defaults = useMemo<QuestionDef[]>(() => defaultQuestions[slug] ?? defaultQuestions.other, [slug]);
  const needsOptions = ["select", "radio", "multiselect"].includes(draft.type);

  const open = (row: QuestionWithOptions | "new") => {
    setEditing(row);
    setDraft(
      row === "new"
        ? emptyQuestion
        : {
            label: row.label,
            key: row.key,
            type: row.type,
            is_required: row.is_required,
            is_enabled: row.is_enabled,
            placeholder: row.placeholder ?? "",
            help_text: row.help_text ?? "",
            options: (row.options ?? []).map((option) => option.label).join("\n"),
          },
    );
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (draft.label.trim().length < 2) {
      toast({ title: "Please enter a question label", tone: "error" });
      return;
    }
    setBusy(true);
    try {
      const input: QuestionInput = {
        id: editing === "new" || !editing ? undefined : editing.id,
        service_id: serviceId,
        key: slugify(draft.key || draft.label).replace(/-/g, "_"),
        label: draft.label.trim(),
        type: draft.type,
        placeholder: draft.placeholder.trim() || null,
        help_text: draft.help_text.trim() || null,
        is_required: draft.is_required,
        is_enabled: draft.is_enabled,
        sort_order: editing === "new" || !editing ? rows.length + 1 : editing.sort_order,
        options: draft.options.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      };
      await saveQuestion(input);
      toast({ title: "Question saved" });
      setEditing(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Save failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const loadDefaults = async () => {
    setBusy(true);
    try {
      for (const [index, question] of defaults.entries()) {
        await saveQuestion({
          service_id: serviceId,
          key: question.key,
          label: question.label,
          type: question.type,
          placeholder: question.placeholder ?? null,
          help_text: question.help ?? null,
          is_required: Boolean(question.required),
          is_enabled: true,
          sort_order: rows.length + index + 1,
          options: question.options ?? [],
        });
      }
      toast({ title: `${defaults.length} default questions added` });
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Could not load defaults", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteQuestion(toDelete.id);
      toast({ title: "Question deleted" });
      setToDelete(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ordered = [...rows];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    try {
      await Promise.all(
        ordered.map((row, position) =>
          saveQuestion({
            id: row.id,
            service_id: row.service_id,
            key: row.key,
            label: row.label,
            type: row.type,
            placeholder: row.placeholder,
            help_text: row.help_text,
            is_required: row.is_required,
            is_enabled: row.is_enabled,
            sort_order: position + 1,
            options: (row.options ?? []).map((option) => option.label),
          }),
        ),
      );
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Reorder failed", description: errorMessage(issue), tone: "error" });
    }
  };

  const canEdit = can("services.manage");

  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <CardHeader
          title="Consultation questions"
          description="Step 2 of the public consultation form shows these questions when this service is selected. Without custom questions, the built-in defaults are used."
          actions={
            canEdit && (
              <>
                {rows.length === 0 && (
                  <AdminButton variant="secondary" icon={ListChecks} loading={busy} onClick={() => void loadDefaults()}>
                    Load default questions
                  </AdminButton>
                )}
                <AdminButton icon={Plus} onClick={() => open("new")}>
                  Add question
                </AdminButton>
              </>
            )
          }
        />
      </div>
      {query.error ? (
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      ) : query.loading && !query.data ? (
        <div className="space-y-2 p-5">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="Using built-in default questions" description={`${defaults.length} default questions are shown for this service. Load them to customize, or add your own.`} />
      ) : (
        <ul className="divide-y divide-[#EEF3F8] border-t border-[#E3EAF3]">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-start gap-3 px-5 py-3">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button type="button" className="text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => void move(index, -1)} disabled={!canEdit || index === 0} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className="text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => void move(index, 1)} disabled={!canEdit || index === rows.length - 1} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  <Badge tone="navy">{QUESTION_TYPES.find((type) => type.key === row.type)?.label ?? row.type}</Badge>
                  {row.is_required && <Badge tone="gold">Required</Badge>}
                  {!row.is_enabled && <Badge tone="gray">Hidden</Badge>}
                </div>
                {row.options && row.options.length > 0 && <p className="mt-0.5 truncate text-xs text-slate-500">{row.options.map((option) => option.label).join(" · ")}</p>}
              </div>
              {canEdit && (
                <div className="flex shrink-0 items-center gap-1">
                  <AdminButton variant="ghost" size="xs" icon={Pencil} onClick={() => open(row)} aria-label="Edit" />
                  <AdminButton variant="ghost" size="xs" icon={Trash} onClick={() => setToDelete(row)} aria-label="Delete" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add question" : "Edit question"}
        size="lg"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" form="question-form" loading={busy}>
              Save question
            </AdminButton>
          </>
        }
      >
        <form id="question-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" htmlFor="q-label" required className="sm:col-span-2">
            <Input id="q-label" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
          </Field>
          <Field label="Type" htmlFor="q-type">
            <Select id="q-type" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as QuestionType })}>
              {QUESTION_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Key" htmlFor="q-key" hint="Auto-generated from the label if left blank.">
            <Input id="q-key" value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} />
          </Field>
          {needsOptions && (
            <Field label="Options" htmlFor="q-options" hint="One option per line." className="sm:col-span-2">
              <Textarea id="q-options" rows={5} value={draft.options} onChange={(event) => setDraft({ ...draft, options: event.target.value })} />
            </Field>
          )}
          <Field label="Placeholder" htmlFor="q-placeholder">
            <Input id="q-placeholder" value={draft.placeholder} onChange={(event) => setDraft({ ...draft, placeholder: event.target.value })} />
          </Field>
          <Field label="Help text" htmlFor="q-help">
            <Input id="q-help" value={draft.help_text} onChange={(event) => setDraft({ ...draft, help_text: event.target.value })} />
          </Field>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <Toggle checked={draft.is_required} onChange={(value) => setDraft({ ...draft, is_required: value })} label="Required" />
            <Toggle checked={draft.is_enabled} onChange={(value) => setDraft({ ...draft, is_enabled: value })} label="Visible in form" />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(toDelete)} title="Delete question?" message={<p>“{toDelete?.label}” will no longer be asked. Existing answers are kept.</p>} confirmLabel="Delete" loading={busy} onCancel={() => setToDelete(null)} onConfirm={() => void remove()} />
    </Card>
  );
}
