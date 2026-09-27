import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, CircleHelp, ExternalLink, Pencil, Plus, Save, Trash } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { createFaq, deleteFaq, ensurePage, listFaqsAdmin, listSections, reorderFaqs, updateFaq, updatePage, upsertSection } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Badge, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea, Toggle, useToast } from "@/admin/components/ui";
import { humanize, useAsync } from "@/admin/utils";
import { pageDefaults, type SectionContent, type SectionValue } from "@/data/pages";
import { errorMessage } from "@/lib/supabase";
import type { FaqRow, PageRow, PageSectionRow } from "@/lib/types";

/* ============================================================ helpers */

type FieldKind = "text" | "textarea" | "lines" | "json";

function kindOf(key: string, value: SectionValue): FieldKind {
  if (Array.isArray(value)) {
    return value.every((item) => typeof item === "string") ? "lines" : "json";
  }
  if (/(description|text|subtitle|paragraph|body)/i.test(key) || (typeof value === "string" && value.length > 70)) return "textarea";
  return "text";
}

function toDraft(content: SectionContent): Record<string, string> {
  const draft: Record<string, string> = {};
  Object.entries(content).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      draft[key] = value.every((item) => typeof item === "string") ? (value as string[]).join("\n") : JSON.stringify(value, null, 2);
    } else {
      draft[key] = value;
    }
  });
  return draft;
}

function fromDraft(draft: Record<string, string>, template: SectionContent): { content: SectionContent; error?: string } {
  const content: SectionContent = {};
  for (const [key, raw] of Object.entries(draft)) {
    const kind = kindOf(key, template[key] ?? "");
    if (kind === "lines") {
      content[key] = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    } else if (kind === "json") {
      try {
        const parsed = JSON.parse(raw || "[]");
        if (!Array.isArray(parsed)) return { content, error: `"${humanize(key)}" must be a JSON list.` };
        content[key] = parsed as Record<string, string>[];
      } catch {
        return { content, error: `"${humanize(key)}" contains invalid JSON.` };
      }
    } else {
      content[key] = raw;
    }
  }
  return { content };
}

/* ======================================================= section editor */

type MergedSection = {
  key: string;
  title: string;
  description?: string;
  enabled: boolean;
  content: SectionContent;
  template: SectionContent;
  sortOrder: number;
  rowId?: string;
};

function SectionEditor({ page, section, canEdit, onSaved }: { page: PageRow; section: MergedSection; canEdit: boolean; onSaved: () => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState<Record<string, string>>(() => toDraft(section.content));
  const [enabled, setEnabled] = useState(section.enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(toDraft(section.content));
    setEnabled(section.enabled);
    setDirty(false);
  }, [section]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const { content, error: parseError } = fromDraft(draft, section.template);
    if (parseError) {
      setError(parseError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await upsertSection({ page_id: page.id, key: section.key, title: section.title, content, is_enabled: enabled, sort_order: section.sortOrder });
      toast({ title: `${section.title} saved`, description: "Changes appear on the public website on the next page load." });
      setDirty(false);
      onSaved();
    } catch (issue) {
      setError(errorMessage(issue));
    } finally {
      setSaving(false);
    }
  };

  const keys = Object.keys(section.template).length ? Object.keys(section.template) : Object.keys(section.content);

  return (
    <Card>
      <form onSubmit={save}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">{section.title}</h2>
              {!enabled && <Badge tone="gray">Hidden</Badge>}
              {dirty && <Badge tone="gold">Unsaved</Badge>}
            </div>
            {section.description && <p className="mt-0.5 text-sm text-slate-500">{section.description}</p>}
          </div>
          <Toggle
            checked={enabled}
            disabled={!canEdit}
            onChange={(value) => {
              setEnabled(value);
              setDirty(true);
            }}
            label={enabled ? "Visible" : "Disabled"}
            size="sm"
          />
        </div>

        {keys.length === 0 ? (
          <p className="rounded-lg bg-[#F4F7FB] px-3 py-2 text-sm text-slate-500">This section has no editable text; use the switch above to show or hide it.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {keys.map((key) => {
              const kind = kindOf(key, section.template[key] ?? section.content[key] ?? "");
              const wide = kind !== "text";
              const value = draft[key] ?? "";
              const update = (next: string) => {
                setDraft((current) => ({ ...current, [key]: next }));
                setDirty(true);
              };
              return (
                <Field
                  key={key}
                  label={humanize(key)}
                  htmlFor={`${section.key}-${key}`}
                  className={wide ? "md:col-span-2" : undefined}
                  hint={kind === "lines" ? "One item per line." : kind === "json" ? "Advanced: JSON list of objects." : undefined}
                >
                  {kind === "text" ? (
                    <Input id={`${section.key}-${key}`} value={value} disabled={!canEdit} onChange={(event) => update(event.target.value)} />
                  ) : (
                    <Textarea id={`${section.key}-${key}`} value={value} disabled={!canEdit} rows={kind === "json" ? 10 : kind === "lines" ? 5 : 4} className={kind === "json" ? "font-mono text-xs" : undefined} onChange={(event) => update(event.target.value)} />
                  )}
                </Field>
              );
            })}
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {canEdit && (
          <div className="mt-4 flex justify-end">
            <AdminButton type="submit" icon={Save} loading={saving} disabled={!dirty && Boolean(section.rowId)}>
              Save section
            </AdminButton>
          </div>
        )}
      </form>
    </Card>
  );
}

/* ============================================================ page */

export function ContentPage() {
  const { slug = "home" } = useParams();
  const definition = pageDefaults[slug];
  const { can } = useAuth();
  const toast = useToast();
  const canEdit = can("content.manage");

  const query = useAsync(async () => {
    if (!definition) return null;
    const page = await ensurePage(slug, definition.title);
    const sections = await listSections(page.id);
    return { page, sections };
  }, [slug]);

  const merged = useMemo<MergedSection[]>(() => {
    if (!definition) return [];
    const rows: PageSectionRow[] = query.data?.sections ?? [];
    return definition.sections.map((section, index) => {
      const row = rows.find((item) => item.key === section.key);
      return {
        key: section.key,
        title: section.title,
        description: section.description,
        enabled: row ? row.is_enabled : section.enabled,
        content: { ...section.content, ...((row?.content ?? {}) as SectionContent) },
        template: section.content,
        sortOrder: index,
        rowId: row?.id,
      };
    });
  }, [definition, query.data]);

  if (!definition) {
    return (
      <Card padded={false}>
        <EmptyState icon={CircleHelp} title="Unknown page" description="This page is not part of the website content model." />
      </Card>
    );
  }

  const page = query.data?.page ?? null;

  const togglePublished = async (value: boolean) => {
    if (!page) return;
    try {
      await updatePage(page.id, { is_published: value });
      toast({ title: value ? "Page sections published" : "Page sections hidden" });
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Website Content"
        title={definition.title}
        description={`Manage the text and visibility of sections on the ${definition.title.toLowerCase()} page.`}
        actions={
          <>
            <Link to={definition.path} target="_blank">
              <AdminButton variant="secondary" icon={ExternalLink}>
                View page
              </AdminButton>
            </Link>
            <Link to="/admin/seo">
              <AdminButton variant="secondary">Page SEO</AdminButton>
            </Link>
          </>
        }
      />

      {query.error ? (
        <Card padded={false}>
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : query.loading && !query.data ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="space-y-4">
          {page && (
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">CMS overrides for this page</p>
                <p className="text-xs text-slate-500">When disabled, the website falls back to its built-in default content for all sections below.</p>
              </div>
              <Toggle checked={page.is_published} disabled={!canEdit} onChange={(value) => void togglePublished(value)} label={page.is_published ? "Active" : "Inactive"} />
            </Card>
          )}
          {slug === "services" && (
            <Card className="border-royal/30 bg-royal/5">
              <p className="text-sm text-ink">
                Individual services (names, descriptions, features, questions) are managed in the{" "}
                <Link to="/admin/services" className="font-semibold text-royal hover:text-navy">
                  Services module
                </Link>
                .
              </p>
            </Card>
          )}
          {slug === "contact" && (
            <Card className="border-royal/30 bg-royal/5">
              <p className="text-sm text-ink">
                Phone, WhatsApp, email, address and social links are managed in{" "}
                <Link to="/admin/settings" className="font-semibold text-royal hover:text-navy">
                  Settings
                </Link>{" "}
                and update the header, footer and contact page automatically.
              </p>
            </Card>
          )}
          {page && merged.map((section) => <SectionEditor key={`${slug}-${section.key}-${section.rowId ?? "new"}`} page={page} section={section} canEdit={canEdit} onSaved={() => void query.refetch(true)} />)}
          {slug === "faq" && <FaqManager />}
        </div>
      )}
    </>
  );
}

/* ============================================================== FAQ */

type FaqDraft = { question: string; answer: string };

function FaqManager() {
  const { can } = useAuth();
  const toast = useToast();
  const canEdit = can("faq.manage");
  const query = useAsync(listFaqsAdmin, []);
  const [editing, setEditing] = useState<FaqRow | "new" | null>(null);
  const [draft, setDraft] = useState<FaqDraft>({ question: "", answer: "" });
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<FaqRow | null>(null);
  const rows = query.data ?? [];

  const openEditor = (row: FaqRow | "new") => {
    setEditing(row);
    setDraft(row === "new" ? { question: "", answer: "" } : { question: row.question, answer: row.answer });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (draft.question.trim().length < 5 || draft.answer.trim().length < 5) {
      toast({ title: "Please enter a question and an answer", tone: "error" });
      return;
    }
    setBusy(true);
    try {
      if (editing === "new") {
        await createFaq({ question: draft.question.trim(), answer: draft.answer.trim(), sort_order: rows.length + 1, is_enabled: true });
        toast({ title: "FAQ added" });
      } else if (editing) {
        await updateFaq(editing.id, { question: draft.question.trim(), answer: draft.answer.trim() });
        toast({ title: "FAQ updated" });
      }
      setEditing(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Save failed", description: errorMessage(issue), tone: "error" });
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
      await reorderFaqs(ordered.map((row) => row.id));
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Reorder failed", description: errorMessage(issue), tone: "error" });
    }
  };

  const toggle = async (row: FaqRow) => {
    try {
      await updateFaq(row.id, { is_enabled: !row.is_enabled });
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteFaq(toDelete.id);
      toast({ title: "FAQ deleted" });
      setToDelete(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <CardHeader
          title="FAQ items"
          description="Questions shown in the FAQ accordion. Disabled items are hidden from the website."
          actions={
            canEdit && (
              <AdminButton icon={Plus} onClick={() => openEditor("new")}>
                Add FAQ
              </AdminButton>
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
          <Skeleton className="h-12" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={CircleHelp} title="No FAQs in the database yet" description="The website shows its built-in FAQ list until you add items here." />
      ) : (
        <ul className="divide-y divide-[#EEF3F8] border-t border-[#E3EAF3]">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button type="button" className="text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => void move(index, -1)} disabled={!canEdit || index === 0} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className="text-slate-400 hover:text-navy disabled:opacity-30" onClick={() => void move(index, 1)} disabled={!canEdit || index === rows.length - 1} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{row.question}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{row.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Toggle size="sm" checked={row.is_enabled} disabled={!canEdit} onChange={() => void toggle(row)} />
                {canEdit && (
                  <>
                    <AdminButton variant="ghost" size="xs" icon={Pencil} onClick={() => openEditor(row)} aria-label="Edit" />
                    <AdminButton variant="ghost" size="xs" icon={Trash} onClick={() => setToDelete(row)} aria-label="Delete" />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add FAQ" : "Edit FAQ"}
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" form="faq-form" loading={busy}>
              Save
            </AdminButton>
          </>
        }
      >
        <form id="faq-form" onSubmit={save} className="space-y-4">
          <Field label="Question" htmlFor="faq-question" required>
            <Input id="faq-question" value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} />
          </Field>
          <Field label="Answer" htmlFor="faq-answer" required>
            <Textarea id="faq-answer" rows={6} value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(toDelete)} title="Delete FAQ?" message={<p>“{toDelete?.question}” will be removed from the website.</p>} confirmLabel="Delete" loading={busy} onCancel={() => setToDelete(null)} onConfirm={() => void remove()} />
    </Card>
  );
}
