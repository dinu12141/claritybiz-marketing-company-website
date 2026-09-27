import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Download, Inbox, Kanban, ListFilter, Plus, Table2, Trash } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  bulkUpdateConsultations,
  createManualConsultation,
  deleteConsultations,
  listAllConsultations,
  listConsultations,
  listConsultationsForMonth,
  listStaff,
  updateConsultation,
  type ConsultationSort,
} from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import {
  AdminButton,
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  Pagination,
  PriorityBadge,
  SearchInput,
  Select,
  StatusBadge,
  TableSkeleton,
  Textarea,
  toneDot,
  useToast,
} from "@/admin/components/ui";
import { downloadCsv, formatDate, formatDateTime, timeAgo, useAsync, useDebouncedValue } from "@/admin/utils";
import { CONSULTATION_STATUSES, CONTACT_METHODS, OTHER_SERVICE, PRIORITIES, contactMethodLabel, statusMeta } from "@/data/consultation";
import { services } from "@/data/services";
import { errorMessage } from "@/lib/supabase";
import type { ConsultationPriority, ConsultationRow, ConsultationStatus, ProfileRow } from "@/lib/types";
import { cn } from "@/utils/cn";

type View = "table" | "kanban" | "calendar";
const PAGE_SIZE = 15;

const serviceFilterOptions = [...services.map((service) => ({ slug: service.slug, name: service.name })), { slug: OTHER_SERVICE.slug, name: OTHER_SERVICE.name }];

export function ConsultationsPage() {
  const [params, setParams] = useSearchParams();
  const view = (params.get("view") as View) || "table";
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { can } = useAuth();
  const staffQuery = useAsync(listStaff, []);
  const staff = staffQuery.data ?? [];

  const setView = (next: View) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("view", next);
    setParams(nextParams, { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Consultations"
        description="Every consultation request, from first contact to completion."
        actions={
          <>
            <div className="flex rounded-lg border border-[#D9E2EC] bg-white p-0.5">
              {(
                [
                  { key: "table", label: "Table", icon: Table2 },
                  { key: "kanban", label: "Kanban", icon: Kanban },
                  { key: "calendar", label: "Calendar", icon: CalendarDays },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = view === item.key;
                return (
                  <button key={item.key} type="button" onClick={() => setView(item.key)} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors", active ? "bg-navy text-white" : "text-slate-600 hover:text-navy")} aria-pressed={active}>
                    <Icon className="h-3.5 w-3.5" /> {item.label}
                  </button>
                );
              })}
            </div>
            {can("consultations.manage") && (
              <AdminButton icon={Plus} onClick={() => setCreateOpen(true)}>
                New consultation
              </AdminButton>
            )}
          </>
        }
      />

      {view === "table" && <TableView staff={staff} refreshKey={refreshKey} />}
      {view === "kanban" && <KanbanView staff={staff} refreshKey={refreshKey} />}
      {view === "calendar" && <CalendarView refreshKey={refreshKey} />}

      <NewConsultationModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => setRefreshKey((key) => key + 1)} />
    </>
  );
}

/* ================================================================ table */

function TableView({ staff, refreshKey }: { staff: ProfileRow[]; refreshKey: number }) {
  const { can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [status, setStatus] = useState<ConsultationStatus | "">("");
  const [service, setService] = useState("");
  const [priority, setPriority] = useState<ConsultationPriority | "">("");
  const [assigned, setAssigned] = useState("");
  const [sort, setSort] = useState<ConsultationSort>("created_desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, service, priority, assigned, sort]);

  const query = useAsync(
    () => listConsultations({ page, pageSize: PAGE_SIZE, search: debouncedSearch, status, service, priority, assigned, sort }),
    [page, debouncedSearch, status, service, priority, assigned, sort, refreshKey],
  );
  const rows = query.data?.rows ?? [];
  const total = query.data?.total ?? 0;
  const staffName = (id: string | null) => staff.find((member) => member.id === id)?.full_name ?? (id ? "Staff" : "Unassigned");

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)));
  const toggleOne = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runBulk = async (patch: Parameters<typeof bulkUpdateConsultations>[1], label: string) => {
    setBulkBusy(true);
    try {
      await bulkUpdateConsultations([...selected], patch);
      toast({ title: `${selected.size} consultation(s) updated`, description: label });
      setSelected(new Set());
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBulkBusy(false);
    }
  };

  const runDelete = async () => {
    setBulkBusy(true);
    try {
      await deleteConsultations([...selected]);
      toast({ title: `${selected.size} consultation(s) deleted` });
      setSelected(new Set());
      setConfirmDelete(false);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBulkBusy(false);
    }
  };

  const exportCsv = () => {
    downloadCsv(
      `consultations-page-${page}.csv`,
      rows.map((row) => ({
        reference: row.reference,
        client: row.client_name,
        business: row.business_name ?? "",
        service: row.service_name,
        priority: row.priority,
        status: row.status,
        assigned_to: staffName(row.assigned_to),
        phone: row.phone,
        email: row.email ?? "",
        preferred_contact: row.preferred_contact,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    );
  };

  const filtersActive = Boolean(status || service || priority || assigned || search);

  return (
    <Card padded={false}>
      <div className="flex flex-col gap-3 border-b border-[#E3EAF3] p-4 lg:flex-row lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, business, reference, phone, email…" className="lg:w-80" />
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Select value={status} onChange={(event) => setStatus(event.target.value as ConsultationStatus | "")} aria-label="Filter by status">
            <option value="">All statuses</option>
            {CONSULTATION_STATUSES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select value={service} onChange={(event) => setService(event.target.value)} aria-label="Filter by service">
            <option value="">All services</option>
            {serviceFilterOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select value={priority} onChange={(event) => setPriority(event.target.value as ConsultationPriority | "")} aria-label="Filter by priority">
            <option value="">All priorities</option>
            {PRIORITIES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select value={assigned} onChange={(event) => setAssigned(event.target.value)} aria-label="Filter by assignee">
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name ?? member.email}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value as ConsultationSort)} aria-label="Sort">
            <option value="created_desc">Newest first</option>
            <option value="created_asc">Oldest first</option>
            <option value="updated_desc">Recently updated</option>
            <option value="priority_desc">Priority</option>
          </Select>
        </div>
        <AdminButton variant="secondary" icon={Download} onClick={exportCsv} disabled={rows.length === 0}>
          Export
        </AdminButton>
      </div>

      {selected.size > 0 && can("consultations.manage") && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E3EAF3] bg-navy px-4 py-2.5 text-sm text-white">
          <span className="font-semibold">{selected.size} selected</span>
          <Select className="h-8 w-auto bg-white py-1 text-xs" defaultValue="" onChange={(event) => event.target.value && void runBulk({ status: event.target.value as ConsultationStatus }, `Status → ${statusMeta(event.target.value).label}`)} disabled={bulkBusy} aria-label="Bulk status">
            <option value="">Change status…</option>
            {CONSULTATION_STATUSES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select className="h-8 w-auto bg-white py-1 text-xs" defaultValue="" onChange={(event) => event.target.value && void runBulk({ assigned_to: event.target.value === "none" ? null : event.target.value }, "Assignment updated")} disabled={bulkBusy} aria-label="Bulk assign">
            <option value="">Assign to…</option>
            <option value="none">Unassigned</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name ?? member.email}
              </option>
            ))}
          </Select>
          <Select className="h-8 w-auto bg-white py-1 text-xs" defaultValue="" onChange={(event) => event.target.value && void runBulk({ priority: event.target.value as ConsultationPriority }, "Priority updated")} disabled={bulkBusy} aria-label="Bulk priority">
            <option value="">Set priority…</option>
            {PRIORITIES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </Select>
          {can("consultations.delete") && (
            <AdminButton variant="danger" size="xs" icon={Trash} onClick={() => setConfirmDelete(true)} disabled={bulkBusy}>
              Delete
            </AdminButton>
          )}
          <button type="button" className="ml-auto text-xs font-semibold text-white/70 hover:text-white" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {query.error ? (
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      ) : query.loading && !query.data ? (
        <TableSkeleton rows={8} cols={7} />
      ) : rows.length === 0 ? (
        <EmptyState icon={filtersActive ? ListFilter : Inbox} title={filtersActive ? "No consultations match these filters" : "No consultations yet"} description={filtersActive ? "Try adjusting the search or filters." : "Requests from the website consultation form will appear here."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" className="h-4 w-4 rounded border-slate-300 text-navy" />
                </th>
                <th className="px-3 py-3 font-semibold">Consultation ID</th>
                <th className="px-3 py-3 font-semibold">Client Name</th>
                <th className="px-3 py-3 font-semibold">Business</th>
                <th className="px-3 py-3 font-semibold">Service</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Assigned To</th>
                <th className="px-3 py-3 font-semibold">Created</th>
                <th className="px-3 py-3 font-semibold">Preferred Contact</th>
                <th className="px-3 py-3 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F8]">
              {rows.map((row) => (
                <tr key={row.id} className={cn("cursor-pointer transition-colors hover:bg-[#F9FBFD]", selected.has(row.id) && "bg-royal/5")} onClick={() => navigate(`/admin/consultations/${row.id}`)}>
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} aria-label={`Select ${row.reference}`} className="h-4 w-4 rounded border-slate-300 text-navy" />
                  </td>
                  <td className="px-3 py-3 font-semibold text-navy">{row.reference}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{row.client_name}</p>
                    <p className="text-xs text-slate-500">{row.phone}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{row.business_name ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-600">{row.service_name}</td>
                  <td className="px-3 py-3">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">{staffName(row.assigned_to)}</td>
                  <td className="px-3 py-3 text-slate-500" title={formatDateTime(row.created_at)}>
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{contactMethodLabel(row.preferred_contact)}</td>
                  <td className="px-3 py-3 text-slate-500" title={formatDateTime(row.updated_at)}>
                    {timeAgo(row.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete consultations?"
        message={
          <p>
            This permanently deletes <strong>{selected.size}</strong> consultation(s) including answers, notes, attachments and activity. This cannot be undone.
          </p>
        }
        confirmLabel="Delete permanently"
        loading={bulkBusy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void runDelete()}
      />
    </Card>
  );
}

/* =============================================================== kanban */

function KanbanView({ staff, refreshKey }: { staff: ProfileRow[]; refreshKey: number }) {
  const { can } = useAuth();
  const toast = useToast();
  const query = useAsync(() => listAllConsultations(500), [refreshKey]);
  const [rows, setRows] = useState<ConsultationRow[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setRows(query.data);
  }, [query.data]);

  const grouped = useMemo(() => {
    const map: Record<string, ConsultationRow[]> = {};
    CONSULTATION_STATUSES.forEach((status) => {
      map[status.key] = [];
    });
    rows.forEach((row) => {
      (map[row.status] ??= []).push(row);
    });
    return map;
  }, [rows]);

  const moveTo = async (id: string, status: ConsultationStatus) => {
    const current = rows.find((row) => row.id === id);
    if (!current || current.status === status) return;
    const previous = rows;
    setRows((list) => list.map((row) => (row.id === id ? { ...row, status } : row)));
    try {
      await updateConsultation(id, { status });
      toast({ title: `${current.reference} moved to ${statusMeta(status).label}` });
    } catch (issue) {
      setRows(previous);
      toast({ title: "Could not move consultation", description: errorMessage(issue), tone: "error" });
    }
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, status: ConsultationStatus) => {
    event.preventDefault();
    setDragOver(null);
    const id = event.dataTransfer.getData("text/plain");
    if (id) void moveTo(id, status);
  };

  if (query.error) {
    return (
      <Card padded={false}>
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      </Card>
    );
  }

  if (!query.loading && rows.length === 0) {
    return (
      <Card padded={false}>
        <EmptyState icon={Kanban} title="No consultations yet" description="Cards will appear here as requests are received." />
      </Card>
    );
  }

  const editable = can("consultations.manage");

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-4">
        {CONSULTATION_STATUSES.map((status) => {
          const items = grouped[status.key] ?? [];
          return (
            <div
              key={status.key}
              className={cn("flex w-[290px] shrink-0 flex-col rounded-2xl border bg-[#EEF3F8]/70 transition-colors", dragOver === status.key ? "border-royal bg-royal/5" : "border-transparent")}
              onDragOver={(event) => {
                if (!editable) return;
                event.preventDefault();
                setDragOver(status.key);
              }}
              onDragLeave={() => setDragOver((current) => (current === status.key ? null : current))}
              onDrop={(event) => editable && onDrop(event, status.key)}
            >
              <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", toneDot[status.tone])} />
                  <h3 className="text-sm font-bold text-ink">{status.label}</h3>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-[#E3EAF3]">{items.length}</span>
              </div>
              <div className="flex-1 space-y-2.5 px-2.5 pb-3">
                {query.loading && rows.length === 0 ? (
                  <div className="h-24 animate-pulse rounded-xl bg-white/70" />
                ) : items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D9E2EC] px-3 py-6 text-center text-xs text-slate-400">No items</div>
                ) : (
                  items.map((row) => (
                    <div
                      key={row.id}
                      draggable={editable}
                      onDragStart={(event) => onDragStart(event, row.id)}
                      className={cn("rounded-xl border border-[#E3EAF3] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md", editable && "cursor-grab active:cursor-grabbing")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/admin/consultations/${row.id}`} className="text-xs font-bold text-navy hover:text-royal">
                          {row.reference}
                        </Link>
                        <PriorityBadge priority={row.priority} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink">{row.client_name}</p>
                      {row.business_name && <p className="text-xs text-slate-500">{row.business_name}</p>}
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <Badge tone="navy">{row.service_name}</Badge>
                        <span className="text-[11px] text-slate-500">{formatDate(row.created_at)}</span>
                      </div>
                      {row.assigned_to && <p className="mt-2 text-[11px] text-slate-500">Assigned: {staff.find((member) => member.id === row.assigned_to)?.full_name ?? "Staff"}</p>}
                      {editable && (
                        <Select className="mt-2.5 h-8 py-1 text-xs" value={row.status} onChange={(event) => void moveTo(row.id, event.target.value as ConsultationStatus)} aria-label={`Move ${row.reference}`}>
                          {CONSULTATION_STATUSES.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================= calendar */

function CalendarView({ refreshKey }: { refreshKey: number }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const query = useAsync(() => listConsultationsForMonth(month), [month.getTime(), refreshKey]);
  const rows = query.data ?? [];

  const eventDate = (row: ConsultationRow) => {
    if (row.scheduled_at) {
      const date = new Date(row.scheduled_at);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    return row.follow_up_date ?? row.preferred_date ?? null;
  };

  const byDay = useMemo(() => {
    const map: Record<string, ConsultationRow[]> = {};
    rows.forEach((row) => {
      const key = eventDate(row);
      if (key) (map[key] ??= []).push(row);
    });
    return map;
  }, [rows]);

  const firstWeekday = (month.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const todayKey = new Date().toISOString().slice(0, 10);
  const monthTitle = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const agenda = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-[#E3EAF3] p-4">
        <div className="flex items-center gap-2">
          <AdminButton variant="secondary" size="xs" icon={ChevronLeft} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" />
          <AdminButton variant="secondary" size="xs" icon={ChevronRight} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" />
          <h2 className="ml-2 text-base font-bold text-ink">{monthTitle}</h2>
        </div>
        <AdminButton
          variant="ghost"
          size="xs"
          onClick={() => {
            const now = new Date();
            setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
        >
          Today
        </AdminButton>
      </div>
      <p className="border-b border-[#E3EAF3] bg-[#F9FBFD] px-4 py-2 text-xs text-slate-500">Shows scheduled consultations, then follow-up dates, then client-preferred dates.</p>
      {query.error ? (
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <>
          <div className="hidden md:block">
            <div className="grid grid-cols-7 border-b border-[#E3EAF3] text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((key, index) => (
                <div key={index} className={cn("min-h-[110px] border-b border-r border-[#EEF3F8] p-1.5", !key && "bg-[#F9FBFD]")}>
                  {key && (
                    <>
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", key === todayKey ? "bg-navy text-white" : "text-slate-600")}>{Number(key.slice(-2))}</span>
                      <div className="mt-1 space-y-1">
                        {(byDay[key] ?? []).slice(0, 3).map((row) => (
                          <Link key={row.id} to={`/admin/consultations/${row.id}`} className={cn("block truncate rounded-md px-1.5 py-1 text-[11px] font-medium text-white", toneDot[statusMeta(row.status).tone])} title={`${row.reference} · ${row.client_name}`}>
                            {row.client_name}
                          </Link>
                        ))}
                        {(byDay[key]?.length ?? 0) > 3 && <p className="px-1 text-[10px] text-slate-500">+{byDay[key].length - 3} more</p>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Agenda</h3>
            {query.loading && rows.length === 0 ? (
              <TableSkeleton rows={3} cols={3} />
            ) : agenda.length === 0 ? (
              <EmptyState compact icon={CalendarDays} title="Nothing on the calendar" description="Set a scheduled date, follow-up date or use client-preferred dates to populate this month." />
            ) : (
              <ul className="space-y-3">
                {agenda.map(([day, items]) => (
                  <li key={day}>
                    <p className="text-xs font-semibold text-ink">{formatDate(day)}</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {items.map((row) => (
                        <li key={row.id}>
                          <Link to={`/admin/consultations/${row.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#E3EAF3] px-3 py-2 text-sm hover:bg-[#F9FBFD]">
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-ink">
                                {row.client_name} <span className="font-normal text-slate-500">· {row.service_name}</span>
                              </span>
                              <span className="text-xs text-slate-500">
                                {row.reference}
                                {row.scheduled_at ? ` · ${new Date(row.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : row.preferred_time ? ` · ${row.preferred_time}` : ""}
                              </span>
                            </span>
                            <StatusBadge status={row.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

/* ============================================================ create */

function NewConsultationModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ service: services[0]?.slug ?? "other", client_name: "", business_name: "", phone: "", whatsapp: "", email: "", city: "", preferred_contact: "phone" as "phone" | "whatsapp" | "email", summary: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.client_name.trim().length < 2 || form.phone.trim().length < 9) {
      setError("Client name and a valid phone number are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const chosen = serviceFilterOptions.find((item) => item.slug === form.service);
      const created = await createManualConsultation({
        service_slug: form.service,
        service_name: chosen?.name ?? "Other",
        client_name: form.client_name.trim(),
        business_name: form.business_name.trim() || undefined,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || undefined,
        email: form.email.trim() || undefined,
        city: form.city.trim() || undefined,
        preferred_contact: form.preferred_contact,
        summary: form.summary.trim() || undefined,
      });
      toast({ title: "Consultation created", description: created.reference });
      onCreated();
      onClose();
      setForm({ ...form, client_name: "", business_name: "", phone: "", whatsapp: "", email: "", city: "", summary: "" });
    } catch (issue) {
      setError(errorMessage(issue));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New consultation"
      description="Record a request received by phone, WhatsApp or in person."
      size="lg"
      footer={
        <>
          <AdminButton variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" form="new-consultation-form" loading={busy}>
            Create consultation
          </AdminButton>
        </>
      }
    >
      <form id="new-consultation-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Service" htmlFor="nc-service" required className="sm:col-span-2">
          <Select id="nc-service" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
            {serviceFilterOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Client name" htmlFor="nc-name" required>
          <Input id="nc-name" value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} />
        </Field>
        <Field label="Business name" htmlFor="nc-business">
          <Input id="nc-business" value={form.business_name} onChange={(event) => setForm({ ...form, business_name: event.target.value })} />
        </Field>
        <Field label="Phone" htmlFor="nc-phone" required>
          <Input id="nc-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </Field>
        <Field label="WhatsApp" htmlFor="nc-whatsapp">
          <Input id="nc-whatsapp" type="tel" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
        </Field>
        <Field label="Email" htmlFor="nc-email">
          <Input id="nc-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
        <Field label="City" htmlFor="nc-city">
          <Input id="nc-city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        </Field>
        <Field label="Preferred contact" htmlFor="nc-contact">
          <Select id="nc-contact" value={form.preferred_contact} onChange={(event) => setForm({ ...form, preferred_contact: event.target.value as "phone" | "whatsapp" | "email" })}>
            {CONTACT_METHODS.map((method) => (
              <option key={method.key} value={method.key}>
                {method.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Summary" htmlFor="nc-summary" className="sm:col-span-2">
          <Textarea id="nc-summary" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Short description of the requirement" />
        </Field>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
