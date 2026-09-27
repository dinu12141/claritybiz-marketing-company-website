import { useMemo, useState } from "react";
import { BadgeCheck, Download, Users } from "lucide-react";
import { consultationCountsByLead, createClientFromLead, listClients, listLeads, updateLead } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Badge, Card, EmptyState, ErrorState, PageHeader, SearchInput, Select, TableSkeleton, Tabs, useToast } from "@/admin/components/ui";
import { downloadCsv, formatDate, useAsync } from "@/admin/utils";
import type { Tone } from "@/data/consultation";
import { errorMessage } from "@/lib/supabase";
import type { LeadStatus } from "@/lib/types";

const leadStatuses: { key: LeadStatus; label: string; tone: Tone }[] = [
  { key: "new", label: "New", tone: "cyan" },
  { key: "active", label: "Active", tone: "blue" },
  { key: "converted", label: "Converted", tone: "green" },
  { key: "lost", label: "Lost", tone: "gray" },
];

export function LeadsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("leads");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const leads = useAsync(listLeads, []);
  const clients = useAsync(listClients, []);
  const counts = useAsync(consultationCountsByLead, []);
  const [busy, setBusy] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (leads.data ?? []).filter((lead) => {
      if (status && lead.status !== status) return false;
      if (!term) return true;
      return [lead.full_name, lead.business_name, lead.phone, lead.email, lead.city].some((value) => value?.toLowerCase().includes(term));
    });
  }, [leads.data, search, status]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (clients.data ?? []).filter((client) => !term || [client.full_name, client.business_name, client.phone, client.email].some((value) => value?.toLowerCase().includes(term)));
  }, [clients.data, search]);

  const changeStatus = async (id: string, next: LeadStatus) => {
    setBusy(id);
    try {
      await updateLead(id, { status: next });
      await leads.refetch(true);
      toast({ title: "Lead updated" });
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const convert = async (leadId: string) => {
    const lead = (leads.data ?? []).find((item) => item.id === leadId);
    if (!lead) return;
    setBusy(leadId);
    try {
      await createClientFromLead(lead);
      await Promise.all([leads.refetch(true), clients.refetch(true)]);
      toast({ title: `${lead.full_name} marked as client` });
    } catch (issue) {
      toast({ title: "Conversion failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const manage = can("leads.manage");

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Leads & Clients"
        description="Every person who has requested a consultation, and those who became clients."
        actions={
          <AdminButton
            variant="secondary"
            icon={Download}
            onClick={() =>
              downloadCsv(
                tab === "leads" ? "leads.csv" : "clients.csv",
                tab === "leads"
                  ? filteredLeads.map((lead) => ({ name: lead.full_name, business: lead.business_name ?? "", phone: lead.phone, email: lead.email ?? "", city: lead.city ?? "", status: lead.status, created_at: lead.created_at }))
                  : filteredClients.map((client) => ({ name: client.full_name, business: client.business_name ?? "", phone: client.phone ?? "", email: client.email ?? "", converted_at: client.converted_at })),
              )
            }
            disabled={(tab === "leads" ? filteredLeads : filteredClients).length === 0}
          >
            Export CSV
          </AdminButton>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-[#E3EAF3] p-4 sm:flex-row sm:items-center">
          <Tabs
            tabs={[
              { key: "leads", label: "Leads", count: leads.data?.length },
              { key: "clients", label: "Clients", count: clients.data?.length },
            ]}
            value={tab}
            onChange={setTab}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, business, phone, email…" className="sm:ml-auto sm:w-72" />
          {tab === "leads" && (
            <Select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus | "")} className="sm:w-40" aria-label="Lead status">
              <option value="">All statuses</option>
              {leadStatuses.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </Select>
          )}
        </div>

        {tab === "leads" ? (
          leads.error ? (
            <ErrorState message={leads.error} onRetry={() => void leads.refetch()} />
          ) : leads.loading && !leads.data ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredLeads.length === 0 ? (
            <EmptyState icon={Users} title={leads.data?.length ? "No leads match your search" : "No leads yet"} description="Leads are created automatically when a consultation request is received." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-semibold">Lead</th>
                    <th className="px-3 py-3 font-semibold">Business</th>
                    <th className="px-3 py-3 font-semibold">Contact</th>
                    <th className="px-3 py-3 font-semibold">Location</th>
                    <th className="px-3 py-3 font-semibold">Consultations</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Created</th>
                    {manage && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3F8]">
                  {filteredLeads.map((lead) => {
                    const meta = leadStatuses.find((item) => item.key === lead.status) ?? leadStatuses[0];
                    return (
                      <tr key={lead.id} className="hover:bg-[#F9FBFD]">
                        <td className="px-4 py-3 font-semibold text-ink">{lead.full_name}</td>
                        <td className="px-3 py-3 text-slate-600">{lead.business_name ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-600">
                          <p>{lead.phone}</p>
                          {lead.email && <p className="text-xs text-slate-500">{lead.email}</p>}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{lead.city ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-600">{counts.data?.[lead.id] ?? 0}</td>
                        <td className="px-3 py-3">
                          {manage ? (
                            <Select className="h-8 w-32 py-1 text-xs" value={lead.status} disabled={busy === lead.id} onChange={(event) => void changeStatus(lead.id, event.target.value as LeadStatus)} aria-label="Lead status">
                              {leadStatuses.map((item) => (
                                <option key={item.key} value={item.key}>
                                  {item.label}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            <Badge tone={meta.tone}>{meta.label}</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-500">{formatDate(lead.created_at)}</td>
                        {manage && (
                          <td className="px-4 py-3 text-right">
                            {lead.status !== "converted" && (
                              <AdminButton variant="secondary" size="xs" icon={BadgeCheck} loading={busy === lead.id} onClick={() => void convert(lead.id)}>
                                Mark as client
                              </AdminButton>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : clients.error ? (
          <ErrorState message={clients.error} onRetry={() => void clients.refetch()} />
        ) : clients.loading && !clients.data ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filteredClients.length === 0 ? (
          <EmptyState icon={BadgeCheck} title="No clients yet" description="Clients are created when a consultation is marked as Converted, or when a lead is marked as a client." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-3 py-3 font-semibold">Business</th>
                  <th className="px-3 py-3 font-semibold">Contact</th>
                  <th className="px-3 py-3 font-semibold">Location</th>
                  <th className="px-3 py-3 font-semibold">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F8]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#F9FBFD]">
                    <td className="px-4 py-3 font-semibold text-ink">{client.full_name}</td>
                    <td className="px-3 py-3 text-slate-600">{client.business_name ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-600">
                      <p>{client.phone ?? "—"}</p>
                      {client.email && <p className="text-xs text-slate-500">{client.email}</p>}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{client.city ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-500">{formatDate(client.converted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
