import { useMemo } from "react";
import { ArrowRight, Bell, CalendarClock, ChartColumn, CircleCheck, Clock, Inbox, Search, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchDashboardData } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Card, CardHeader, EmptyState, ErrorState, PageHeader, PriorityBadge, Skeleton, StatCard, StatusBadge } from "@/admin/components/ui";
import { formatDate, monthLabel, timeAgo, useAsync } from "@/admin/utils";
import { CONSULTATION_STATUSES, type Tone } from "@/data/consultation";
import type { ConsultationRow } from "@/lib/types";

const toneHex: Record<Tone, string> = {
  gray: "#94A3B8",
  blue: "#087FC1",
  cyan: "#36B5E5",
  gold: "#F5C400",
  amber: "#F97316",
  green: "#10B981",
  red: "#EF4444",
  purple: "#8B5CF6",
  navy: "#062B52",
};

const chartTooltipStyle = { borderRadius: 12, border: "1px solid #E3EAF3", boxShadow: "0 10px 30px -12px rgba(6,43,82,0.25)", fontSize: 12 };

function ChartCard({ title, description, children, empty }: { title: string; description?: string; children: React.ReactNode; empty: boolean }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      {empty ? <EmptyState compact icon={ChartColumn} title="Not enough data yet" description="This chart fills in automatically as consultations are received." /> : children}
    </Card>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const { data, loading, error, refetch } = useAsync(fetchDashboardData, []);

  const stats = useMemo(() => {
    const rows: ConsultationRow[] = data?.consultations ?? [];
    const byStatus: Record<string, number> = {};
    rows.forEach((row) => {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonth = rows.filter((row) => new Date(row.created_at).getTime() >= monthStart).length;
    const total = rows.length;
    const cancelled = byStatus.cancelled ?? 0;
    const converted = (byStatus.converted ?? 0) + (byStatus.completed ?? 0);
    const denominator = total - cancelled;
    const conversionRate = denominator > 0 ? Math.round((converted / denominator) * 100) : null;
    const inProgress = (byStatus.contacted ?? 0) + (byStatus.consultation_scheduled ?? 0) + (byStatus.proposal_sent ?? 0);

    // Last 30 days
    const days: { label: string; count: number; key: string }[] = [];
    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({ key, label: `${date.getDate()}/${date.getMonth() + 1}`, count: 0 });
    }
    const dayIndex = new Map(days.map((day, index) => [day.key, index]));
    rows.forEach((row) => {
      const key = new Date(row.created_at).toISOString().slice(0, 10);
      const index = dayIndex.get(key);
      if (index !== undefined) days[index].count += 1;
    });

    // By service
    const serviceMap = new Map<string, number>();
    rows.forEach((row) => serviceMap.set(row.service_name, (serviceMap.get(row.service_name) ?? 0) + 1));
    const byService = [...serviceMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    // By status (pie)
    const statusSeries = CONSULTATION_STATUSES.filter((status) => (byStatus[status.key] ?? 0) > 0).map((status) => ({
      name: status.label,
      value: byStatus[status.key] ?? 0,
      color: toneHex[status.tone],
    }));

    // Funnel
    const beyondReview = rows.filter((row) => !["new", "under_review", "cancelled"].includes(row.status)).length;
    const scheduledPlus = rows.filter((row) => ["consultation_scheduled", "proposal_sent", "converted", "completed"].includes(row.status)).length;
    const funnel = [
      { stage: "Received", count: total },
      { stage: "Contacted", count: beyondReview },
      { stage: "Scheduled", count: scheduledPlus },
      { stage: "Converted", count: converted },
    ];

    // Monthly (last 6 months)
    const months: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${date.getFullYear()}-${date.getMonth()}`, label: monthLabel(date), count: 0 });
    }
    const monthIndex = new Map(months.map((month, index) => [month.key, index]));
    rows.forEach((row) => {
      const date = new Date(row.created_at);
      const index = monthIndex.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (index !== undefined) months[index].count += 1;
    });

    return {
      total,
      byStatus,
      thisMonth,
      conversionRate,
      inProgress,
      days,
      byService,
      statusSeries,
      funnel,
      months,
      recent: rows.slice(0, 6),
      upcoming: rows
        .filter((row) => row.scheduled_at && new Date(row.scheduled_at).getTime() >= Date.now() - 86400000)
        .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
        .slice(0, 5),
    };
  }, [data]);

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Card padded={false}>
          <ErrorState message={error} onRetry={() => void refetch()} />
        </Card>
      </>
    );
  }

  const empty = !loading && stats.total === 0;
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        description="A live overview of consultation requests, leads and activity."
        actions={
          <Link to="/admin/consultations">
            <AdminButton variant="secondary" icon={Inbox}>
              Open consultations
            </AdminButton>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="New Consultations" value={stats.byStatus.new ?? 0} icon={Inbox} tone="cyan" loading={loading} />
        <StatCard label="Pending Review" value={stats.byStatus.under_review ?? 0} icon={Search} tone="amber" loading={loading} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} tone="blue" loading={loading} hint="Contacted, scheduled or proposal sent" />
        <StatCard label="Scheduled" value={stats.byStatus.consultation_scheduled ?? 0} icon={CalendarClock} tone="purple" loading={loading} />
        <StatCard label="Completed" value={stats.byStatus.completed ?? 0} icon={CircleCheck} tone="green" loading={loading} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Leads" value={data?.leadsCount ?? 0} icon={Users} tone="navy" loading={loading} />
        <StatCard label="This Month" value={stats.thisMonth} icon={TrendingUp} tone="blue" loading={loading} hint="Consultations received" />
        <StatCard label="Conversion Rate" value={stats.conversionRate === null ? "—" : `${stats.conversionRate}%`} icon={ChartColumn} tone="gold" loading={loading} hint="Converted or completed vs. active requests" />
        <StatCard label="Unread Messages" value={data?.unread ?? 0} icon={Bell} tone="red" loading={loading} hint="Notifications awaiting review" />
      </div>

      {empty ? (
        <Card className="mt-6" padded={false}>
          <EmptyState
            icon={Inbox}
            title="No consultations yet"
            description="Requests submitted through the website consultation form will appear here with live statistics and charts."
            action={
              <Link to="/consultation" target="_blank">
                <AdminButton variant="secondary">Open the public consultation form</AdminButton>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ChartCard title="Consultations over time" description="Requests received in the last 30 days" empty={empty}>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={stats.days} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#087FC1" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#087FC1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area type="monotone" dataKey="count" name="Consultations" stroke="#087FC1" strokeWidth={2} fill="url(#fillBlue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
            <ChartCard title="Consultations by status" description="Current pipeline distribution" empty={!loading && stats.statusSeries.length === 0}>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stats.statusSeries} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="#fff">
                        {stats.statusSeries.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {stats.statusSeries.map((entry) => (
                      <li key={entry.name} className="flex items-center justify-between gap-2 text-slate-600">
                        <span className="flex items-center gap-2 truncate">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-ink">{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <ChartCard title="Consultations by service" description="Which services generate requests" empty={!loading && stats.byService.length === 0}>
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={stats.byService} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" name="Consultations" fill="#087FC1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Lead conversion" description="Progression through the pipeline" empty={empty}>
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={stats.funnel} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="stage" width={80} tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" name="Consultations" radius={[0, 6, 6, 0]}>
                      {stats.funnel.map((entry, index) => (
                        <Cell key={entry.stage} fill={["#36B5E5", "#087FC1", "#8B5CF6", "#10B981"][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Monthly consultation volume" description="Last six months" empty={empty}>
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={stats.months} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" name="Consultations" fill="#062B52" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Card padded={false} className="xl:col-span-2">
              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <h2 className="text-base font-bold text-ink">Recent consultations</h2>
                  <p className="text-sm text-slate-500">Latest requests received</p>
                </div>
                <Link to="/admin/consultations" className="inline-flex items-center gap-1 text-sm font-semibold text-royal hover:text-navy">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-y border-[#E3EAF3] bg-[#F9FBFD] text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-2.5 font-semibold">Reference</th>
                      <th className="px-3 py-2.5 font-semibold">Client</th>
                      <th className="px-3 py-2.5 font-semibold">Service</th>
                      <th className="px-3 py-2.5 font-semibold">Priority</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-5 py-2.5 font-semibold">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3F8]">
                    {loading
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index}>
                            <td colSpan={6} className="px-5 py-3">
                              <Skeleton className="h-6 w-full" />
                            </td>
                          </tr>
                        ))
                      : stats.recent.map((row) => (
                          <tr key={row.id} className="hover:bg-[#F9FBFD]">
                            <td className="px-5 py-3">
                              <Link to={`/admin/consultations/${row.id}`} className="font-semibold text-navy hover:text-royal">
                                {row.reference}
                              </Link>
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-medium text-ink">{row.client_name}</p>
                              {row.business_name && <p className="text-xs text-slate-500">{row.business_name}</p>}
                            </td>
                            <td className="px-3 py-3 text-slate-600">{row.service_name}</td>
                            <td className="px-3 py-3">
                              <PriorityBadge priority={row.priority} />
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-5 py-3 text-slate-500" title={formatDate(row.created_at)}>
                              {timeAgo(row.created_at)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card>
              <CardHeader title="Upcoming schedule" description="Scheduled consultations" />
              {loading ? (
                <Skeleton className="h-40 w-full" />
              ) : stats.upcoming.length === 0 ? (
                <EmptyState compact icon={CalendarClock} title="Nothing scheduled" description="Set a scheduled date on a consultation to see it here." />
              ) : (
                <ul className="space-y-3">
                  {stats.upcoming.map((row) => (
                    <li key={row.id}>
                      <Link to={`/admin/consultations/${row.id}`} className="flex items-start gap-3 rounded-xl border border-[#E3EAF3] p-3 transition-colors hover:border-royal/40 hover:bg-[#F9FBFD]">
                        <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-navy text-white">
                          <span className="text-[10px] uppercase leading-none text-white/60">{new Date(row.scheduled_at!).toLocaleString("en-GB", { month: "short" })}</span>
                          <span className="text-sm font-bold leading-tight">{new Date(row.scheduled_at!).getDate()}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">{row.client_name}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {row.service_name} · {new Date(row.scheduled_at!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
