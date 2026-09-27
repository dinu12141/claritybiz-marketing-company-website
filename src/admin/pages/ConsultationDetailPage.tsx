import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarClock,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Trash,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addNote, deleteAttachment, deleteConsultations, deleteNote, getAttachmentUrl, getConsultationBundle, listStaff, updateConsultation, type ConsultationPatch } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Avatar, Badge, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, PriorityBadge, Select, Skeleton, StatusBadge, Textarea, toneDot, useToast } from "@/admin/components/ui";
import { formatBytes, formatDate, formatDateTime, fromDateTimeLocal, timeAgo, toDateTimeLocal, useAsync } from "@/admin/utils";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CONSULTATION_STATUSES, PRIORITIES, contactMethodLabel, statusMeta } from "@/data/consultation";
import { errorMessage } from "@/lib/supabase";
import type { ActivityType, ConsultationAttachmentRow, ConsultationPriority, ConsultationStatus } from "@/lib/types";
import { cn } from "@/utils/cn";

const activityIcon: Record<ActivityType, typeof Activity> = {
  created: FileText,
  status_changed: Activity,
  priority_changed: Activity,
  assigned: UserRound,
  note_added: MessageSquare,
  attachment_uploaded: Paperclip,
  updated: Clock,
};

export function ConsultationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { can, user } = useAuth();
  const bundle = useAsync(() => getConsultationBundle(id), [id]);
  const staffQuery = useAsync(listStaff, []);
  const staff = staffQuery.data ?? [];
  const [saving, setSaving] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<ConsultationAttachmentRow | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const consultation = bundle.data?.consultation ?? null;
  const editable = can("consultations.manage");

  useEffect(() => {
    if (consultation) {
      setFollowUp(consultation.follow_up_date ?? "");
      setScheduledAt(toDateTimeLocal(consultation.scheduled_at));
    }
  }, [consultation]);

  const staffName = (staffId: string | null) => staff.find((member) => member.id === staffId)?.full_name ?? (staffId ? "Staff member" : "Unassigned");

  const save = async (patch: ConsultationPatch, label: string, key: string) => {
    setSaving(key);
    try {
      await updateConsultation(id, patch);
      toast({ title: label });
      await bundle.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setSaving(null);
    }
  };

  const submitNote = async (event: FormEvent) => {
    event.preventDefault();
    if (noteBody.trim().length < 2 || !user) return;
    setNoteBusy(true);
    try {
      await addNote(id, noteBody.trim(), user.id);
      setNoteBody("");
      toast({ title: "Note added" });
      await bundle.refetch(true);
    } catch (issue) {
      toast({ title: "Could not add note", description: errorMessage(issue), tone: "error" });
    } finally {
      setNoteBusy(false);
    }
  };

  const openAttachment = async (attachment: ConsultationAttachmentRow) => {
    try {
      const url = await getAttachmentUrl(attachment.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (issue) {
      toast({ title: "Could not open attachment", description: errorMessage(issue), tone: "error" });
    }
  };

  const removeConsultation = async () => {
    setDeleting(true);
    try {
      await deleteConsultations([id]);
      toast({ title: "Consultation deleted" });
      navigate("/admin/consultations", { replace: true });
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
      setDeleting(false);
    }
  };

  if (bundle.error) {
    return (
      <Card padded={false}>
        <ErrorState message={bundle.error} onRetry={() => void bundle.refetch()} />
      </Card>
    );
  }

  if (bundle.loading || !consultation) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const { answers, attachments, notes, activity } = bundle.data!;
  const statusHistory = activity.filter((item) => item.type === "status_changed" || item.type === "created");
  const whatsappNumber = (consultation.whatsapp || consultation.phone).replace(/\D/g, "");

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/admin/consultations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy">
            <ArrowLeft className="h-3.5 w-3.5" /> All consultations
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{consultation.reference}</h1>
            <StatusBadge status={consultation.status} />
            <PriorityBadge priority={consultation.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {consultation.service_name} · Received {formatDateTime(consultation.created_at)} · Source: {consultation.source}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${consultation.phone}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D9E2EC] bg-white px-3 text-sm font-semibold text-ink hover:bg-[#F4F7FB]">
            <Phone className="h-4 w-4 text-royal" /> Call
          </a>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D9E2EC] bg-white px-3 text-sm font-semibold text-ink hover:bg-[#F4F7FB]">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
          </a>
          {consultation.email && (
            <a href={`mailto:${consultation.email}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D9E2EC] bg-white px-3 text-sm font-semibold text-ink hover:bg-[#F4F7FB]">
              <Mail className="h-4 w-4 text-royal" /> Email
            </a>
          )}
          {can("consultations.delete") && (
            <AdminButton variant="danger" icon={Trash} onClick={() => setConfirmDelete(true)}>
              Delete
            </AdminButton>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Client & business */}
          <Card>
            <CardHeader title="Client information" />
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Info icon={UserRound} label="Client name" value={consultation.client_name} />
              <Info icon={Building2} label="Business / Company" value={consultation.business_name ?? "—"} />
              <Info icon={Phone} label="Phone" value={consultation.phone} />
              <Info icon={MessageSquare} label="WhatsApp" value={consultation.whatsapp ?? "—"} />
              <Info icon={Mail} label="Email" value={consultation.email ?? "—"} />
              <Info icon={MapPin} label="City / Location" value={consultation.city ?? "—"} />
            </dl>
          </Card>

          {/* Requirement */}
          <Card>
            <CardHeader title="Submitted requirement" description={`Service: ${consultation.service_name}`} />
            {answers.length === 0 && !consultation.summary ? (
              <EmptyState compact icon={FileText} title="No additional details" description="The client did not provide extra answers." />
            ) : (
              <dl className="divide-y divide-[#EEF3F8]">
                {answers.map((answer) => (
                  <div key={answer.id} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
                    <dt className="text-sm text-slate-500">{answer.question_label}</dt>
                    <dd className="whitespace-pre-wrap text-sm font-medium text-ink">{answer.answer || "—"}</dd>
                  </div>
                ))}
                {answers.length === 0 && consultation.summary && (
                  <div className="py-3">
                    <dt className="text-sm text-slate-500">Summary</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-ink">{consultation.summary}</dd>
                  </div>
                )}
              </dl>
            )}
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader title="Attachments" description="Stored privately; links expire after one hour." />
            {attachments.length === 0 ? (
              <EmptyState compact icon={Paperclip} title="No attachments" />
            ) : (
              <ul className="divide-y divide-[#EEF3F8]">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8] text-royal">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => void openAttachment(attachment)} className="block truncate text-left text-sm font-semibold text-navy hover:text-royal">
                        {attachment.file_name}
                      </button>
                      <p className="text-xs text-slate-500">
                        {attachment.mime_type ?? "file"} · {formatBytes(attachment.size_bytes)} · {formatDate(attachment.created_at)}
                      </p>
                    </div>
                    {can("consultations.delete") && (
                      <AdminButton variant="ghost" size="xs" icon={Trash} onClick={() => setAttachmentToDelete(attachment)} aria-label={`Delete ${attachment.file_name}`} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader title="Internal notes" description="Private to staff — never shown to the client." />
            {editable && (
              <form onSubmit={submitNote} className="mb-4">
                <Textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder='e.g. "Client contacted via WhatsApp."' rows={3} />
                <div className="mt-2 flex justify-end">
                  <AdminButton type="submit" loading={noteBusy} disabled={noteBody.trim().length < 2}>
                    Add note
                  </AdminButton>
                </div>
              </form>
            )}
            {notes.length === 0 ? (
              <EmptyState compact icon={MessageSquare} title="No notes yet" />
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li key={note.id} className="flex gap-3 rounded-xl border border-[#E3EAF3] p-3">
                    <Avatar name={staffName(note.author_id)} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-ink">{staffName(note.author_id)}</p>
                        <span className="text-[11px] text-slate-500">{formatDateTime(note.created_at)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.body}</p>
                    </div>
                    {(note.author_id === user?.id || can("consultations.delete")) && (
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-600"
                        aria-label="Delete note"
                        onClick={async () => {
                          try {
                            await deleteNote(note.id);
                            await bundle.refetch(true);
                          } catch (issue) {
                            toast({ title: "Could not delete note", description: errorMessage(issue), tone: "error" });
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader title="Activity timeline" description="Automatically recorded events." />
            {activity.length === 0 ? (
              <EmptyState compact icon={Activity} title="No activity recorded" />
            ) : (
              <ol className="relative space-y-4 border-l border-[#E3EAF3] pl-6">
                {activity.map((item) => {
                  const Icon = activityIcon[item.type] ?? Activity;
                  return (
                    <li key={item.id} className="relative">
                      <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-[#E3EAF3]">
                        <Icon className="h-3 w-3 text-royal" />
                      </span>
                      <p className="text-sm text-ink">{item.description}</p>
                      <p className="text-xs text-slate-500">
                        {item.actor_id ? staffName(item.actor_id) : "System / website"} · {formatDateTime(item.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Management" />
            <div className="space-y-4">
              <Field label="Status" htmlFor="c-status">
                <Select id="c-status" value={consultation.status} disabled={!editable || saving === "status"} onChange={(event) => void save({ status: event.target.value as ConsultationStatus }, `Status set to ${statusMeta(event.target.value).label}`, "status")}>
                  {CONSULTATION_STATUSES.map((status) => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority" htmlFor="c-priority">
                <Select id="c-priority" value={consultation.priority} disabled={!editable || saving === "priority"} onChange={(event) => void save({ priority: event.target.value as ConsultationPriority }, "Priority updated", "priority")}>
                  {PRIORITIES.map((priority) => (
                    <option key={priority.key} value={priority.key}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Assigned staff member" htmlFor="c-assigned">
                <Select id="c-assigned" value={consultation.assigned_to ?? ""} disabled={!editable || saving === "assigned"} onChange={(event) => void save({ assigned_to: event.target.value || null }, "Assignment updated", "assigned")}>
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name ?? member.email}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Follow-up date" htmlFor="c-followup">
                <div className="flex gap-2">
                  <Input id="c-followup" type="date" value={followUp} disabled={!editable} onChange={(event) => setFollowUp(event.target.value)} />
                  {editable && (
                    <AdminButton variant="secondary" loading={saving === "followup"} onClick={() => void save({ follow_up_date: followUp || null }, "Follow-up date saved", "followup")}>
                      Save
                    </AdminButton>
                  )}
                </div>
              </Field>
              <Field label="Scheduled consultation" htmlFor="c-scheduled" hint="Appears in the calendar and dashboard.">
                <div className="flex gap-2">
                  <Input id="c-scheduled" type="datetime-local" value={scheduledAt} disabled={!editable} onChange={(event) => setScheduledAt(event.target.value)} />
                  {editable && (
                    <AdminButton variant="secondary" loading={saving === "scheduled"} onClick={() => void save({ scheduled_at: fromDateTimeLocal(scheduledAt) }, "Schedule saved", "scheduled")}>
                      Save
                    </AdminButton>
                  )}
                </div>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Client preferences" />
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Preferred contact</dt>
                <dd>
                  <Badge tone="blue">{contactMethodLabel(consultation.preferred_contact)}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Preferred date</dt>
                <dd className="font-medium text-ink">{consultation.preferred_date ? formatDate(consultation.preferred_date) : "Any"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Preferred time</dt>
                <dd className="font-medium text-ink">{consultation.preferred_time ?? "Any"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Timezone</dt>
                <dd className="text-right font-medium text-ink">{consultation.preferred_timezone ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="font-medium text-ink">{timeAgo(consultation.updated_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Status history" />
            {statusHistory.length === 0 ? (
              <EmptyState compact icon={CalendarClock} title="No status changes yet" />
            ) : (
              <ul className="space-y-2.5">
                {statusHistory.map((item) => {
                  const to = (item.metadata?.to as string | undefined) ?? (item.type === "created" ? "new" : undefined);
                  return (
                    <li key={item.id} className="flex items-start gap-3 text-sm">
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", to ? toneDot[statusMeta(to).tone] : "bg-slate-400")} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{to ? statusMeta(to).label : item.description}</p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(item.created_at)} · {item.actor_id ? staffName(item.actor_id) : "System"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this consultation?"
        message={<p>All answers, notes, attachments and activity for {consultation.reference} will be permanently removed.</p>}
        confirmLabel="Delete permanently"
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void removeConsultation()}
      />
      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        title="Delete attachment?"
        message={<p>{attachmentToDelete?.file_name} will be removed from secure storage.</p>}
        confirmLabel="Delete"
        onCancel={() => setAttachmentToDelete(null)}
        onConfirm={async () => {
          if (!attachmentToDelete) return;
          try {
            await deleteAttachment(attachmentToDelete);
            toast({ title: "Attachment deleted" });
            setAttachmentToDelete(null);
            await bundle.refetch(true);
          } catch (issue) {
            toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
          }
        }}
      />
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F8] text-royal">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="break-words text-sm font-semibold text-ink">{value}</dd>
      </div>
    </div>
  );
}
