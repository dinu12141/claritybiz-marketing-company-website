import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Bell, CheckCheck, Images, Save, ScrollText, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getSiteSettings,
  listAuditLogs,
  listNotifications,
  listPermissions,
  listProfiles,
  listRolePermissions,
  listRoles,
  listSeo,
  markAllNotificationsRead,
  markNotificationRead,
  saveSiteSettings,
  setRolePermission,
  updateProfile,
  upsertSeo,
} from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Avatar, Badge, Card, CardHeader, EmptyState, ErrorState, Field, Input, PageHeader, Pagination, Select, Skeleton, TableSkeleton, Tabs, Textarea, Toggle, useToast } from "@/admin/components/ui";
import { MediaPickerModal } from "@/admin/pages/MediaPage";
import { formatDateTime, humanize, timeAgo, useAsync } from "@/admin/utils";
import { pageDefaults } from "@/data/pages";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { errorMessage } from "@/lib/supabase";
import type { SeoSettingRow } from "@/lib/types";
import { cn } from "@/utils/cn";

/* ================================================================ SEO */

type SeoDraft = Pick<SeoSettingRow, "title" | "description" | "og_title" | "og_description" | "og_image_url" | "favicon_url" | "robots">;
const emptySeo: SeoDraft = { title: "", description: "", og_title: "", og_description: "", og_image_url: "", favicon_url: "", robots: "" };

function SeoForm({ pagePath, row, global, onSaved }: { pagePath: string; row?: SeoSettingRow; global?: boolean; onSaved: () => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState<SeoDraft>(emptySeo);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<"og" | "favicon" | null>(null);

  useEffect(() => {
    setDraft({
      title: row?.title ?? "",
      description: row?.description ?? "",
      og_title: row?.og_title ?? "",
      og_description: row?.og_description ?? "",
      og_image_url: row?.og_image_url ?? "",
      favicon_url: row?.favicon_url ?? "",
      robots: row?.robots ?? "",
    });
  }, [row]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await upsertSeo({
        page_path: pagePath,
        title: draft.title || null,
        description: draft.description || null,
        og_title: draft.og_title || null,
        og_description: draft.og_description || null,
        og_image_url: draft.og_image_url || null,
        favicon_url: draft.favicon_url || null,
        robots: draft.robots || null,
      });
      toast({ title: "SEO settings saved" });
      onSaved();
    } catch (issue) {
      toast({ title: "Save failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <Field label={global ? "Site title" : "Page title"} htmlFor={`${pagePath}-title`} hint={global ? "Used as the default browser title for the homepage." : "Overrides the built-in title."}>
        <Input id={`${pagePath}-title`} value={draft.title ?? ""} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      </Field>
      <Field label="Meta description" htmlFor={`${pagePath}-desc`} hint={`${(draft.description ?? "").length}/160`}>
        <Textarea id={`${pagePath}-desc`} rows={2} value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </Field>
      <Field label="Open Graph title" htmlFor={`${pagePath}-og-title`}>
        <Input id={`${pagePath}-og-title`} value={draft.og_title ?? ""} onChange={(event) => setDraft({ ...draft, og_title: event.target.value })} />
      </Field>
      <Field label="Open Graph description" htmlFor={`${pagePath}-og-desc`}>
        <Textarea id={`${pagePath}-og-desc`} rows={2} value={draft.og_description ?? ""} onChange={(event) => setDraft({ ...draft, og_description: event.target.value })} />
      </Field>
      {global && (
        <>
          <Field label="Social share image" htmlFor="seo-og-image" hint="Recommended 1200×630 px.">
            <div className="flex gap-2">
              <Input id="seo-og-image" value={draft.og_image_url ?? ""} placeholder="https://…" onChange={(event) => setDraft({ ...draft, og_image_url: event.target.value })} />
              <AdminButton variant="secondary" icon={Images} onClick={() => setPicker("og")} aria-label="Choose image" />
            </div>
          </Field>
          <Field label="Favicon" htmlFor="seo-favicon" hint="PNG, SVG or ICO. Leave empty to use the company logo.">
            <div className="flex gap-2">
              <Input id="seo-favicon" value={draft.favicon_url ?? ""} placeholder="https://…" onChange={(event) => setDraft({ ...draft, favicon_url: event.target.value })} />
              <AdminButton variant="secondary" icon={Images} onClick={() => setPicker("favicon")} aria-label="Choose favicon" />
            </div>
          </Field>
          <Field label="Robots" htmlFor="seo-robots">
            <Select id="seo-robots" value={draft.robots ?? ""} onChange={(event) => setDraft({ ...draft, robots: event.target.value })}>
              <option value="">Default (index, follow)</option>
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </Select>
          </Field>
        </>
      )}
      <div className="flex justify-end sm:col-span-2">
        <AdminButton type="submit" icon={Save} loading={saving}>
          Save
        </AdminButton>
      </div>
      <MediaPickerModal open={picker !== null} onClose={() => setPicker(null)} onSelect={(url) => setDraft((current) => (picker === "favicon" ? { ...current, favicon_url: url } : { ...current, og_image_url: url }))} />
    </form>
  );
}

export function SeoPage() {
  const query = useAsync(listSeo, []);
  const rows = query.data ?? [];
  const [selected, setSelected] = useState("/");
  const pagePaths = useMemo(() => {
    const base = Object.values(pageDefaults).map((page) => ({ path: page.path, label: page.title }));
    const servicePaths = services.map((service) => ({ path: service.path, label: `Service: ${service.name}` }));
    return [...base, ...servicePaths];
  }, []);
  const globalRow = rows.find((row) => row.page_path === "global");
  const selectedRow = rows.find((row) => row.page_path === selected);

  return (
    <>
      <PageHeader eyebrow="Website" title="SEO" description="Global metadata and page-level overrides for search engines and social sharing." />
      {query.error ? (
        <Card padded={false}>
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : query.loading && !query.data ? (
        <Skeleton className="h-80" />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Global settings" description="Apply to the whole website." />
            <SeoForm pagePath="global" row={globalRow} global onSaved={() => void query.refetch(true)} />
          </Card>
          <Card>
            <CardHeader
              title="Page-level settings"
              description="Override the title and description of a specific page."
              actions={
                <Select value={selected} onChange={(event) => setSelected(event.target.value)} className="w-64" aria-label="Select page">
                  {pagePaths.map((page) => (
                    <option key={page.path} value={page.path}>
                      {page.label} ({page.path})
                    </option>
                  ))}
                </Select>
              }
            />
            <SeoForm key={selected} pagePath={selected} row={selectedRow} onSaved={() => void query.refetch(true)} />
          </Card>
        </div>
      )}
    </>
  );
}

/* =========================================================== settings */

const settingFields: { key: string; label: string; hint?: string; type?: "text" | "tel" | "email" | "url" | "textarea"; placeholder?: string }[] = [
  { key: "company_name", label: "Company name", placeholder: site.name },
  { key: "short_name", label: "Short name", placeholder: site.shortName },
  { key: "tagline", label: "Tagline", placeholder: site.tagline },
  { key: "description", label: "Company description", type: "textarea", placeholder: site.description },
  { key: "phone_display", label: "Phone (display)", type: "tel", placeholder: site.phoneDisplay },
  { key: "phone_e164", label: "Phone (international, for tel: links)", type: "tel", placeholder: site.phoneE164, hint: "Format: +94XXXXXXXXX" },
  { key: "whatsapp_number", label: "WhatsApp number", type: "tel", placeholder: site.whatsappNumber, hint: "Digits only with country code, e.g. 94714053449" },
  { key: "email", label: "Email address", type: "email", placeholder: "info@example.com" },
  { key: "location", label: "Location (short)", placeholder: site.location },
  { key: "address", label: "Address", type: "textarea", placeholder: site.address },
  { key: "business_hours", label: "Business hours", placeholder: "Mon – Fri, 9:00 – 17:00" },
  { key: "facebook_url", label: "Facebook URL", type: "url", placeholder: site.facebookUrl },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "youtube_url", label: "YouTube URL", type: "url" },
  { key: "x_url", label: "X (Twitter) URL", type: "url" },
  { key: "tiktok_url", label: "TikTok URL", type: "url" },
];

export function SettingsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const query = useAsync(getSiteSettings, []);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (query.data) setValues(query.data);
  }, [query.data]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await saveSiteSettings(values, user.id);
      toast({ title: "Settings saved", description: "Header, footer and contact details update on the next page load." });
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Save failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="System" title="Settings" description="Contact and business details used across the public website." />
      {query.error ? (
        <Card padded={false}>
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : query.loading && !query.data ? (
        <Skeleton className="h-96" />
      ) : (
        <form onSubmit={save}>
          <Card>
            <CardHeader title="Business & contact information" description="Empty fields fall back to the built-in defaults." />
            <div className="grid gap-4 sm:grid-cols-2">
              {settingFields.map((field) => (
                <Field key={field.key} label={field.label} htmlFor={`setting-${field.key}`} hint={field.hint} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                  {field.type === "textarea" ? (
                    <Textarea id={`setting-${field.key}`} rows={3} value={values[field.key] ?? ""} placeholder={field.placeholder} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} />
                  ) : (
                    <Input id={`setting-${field.key}`} type={field.type ?? "text"} value={values[field.key] ?? ""} placeholder={field.placeholder} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} />
                  )}
                </Field>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E3EAF3] pt-4">
              <p className="text-xs text-slate-500">Notification channels (email, WhatsApp, SMS) are configured server-side via environment variables — no credentials are stored here.</p>
              <AdminButton type="submit" icon={Save} loading={saving}>
                Save settings
              </AdminButton>
            </div>
          </Card>
        </form>
      )}
    </>
  );
}

/* ====================================================== notifications */

export function NotificationsPage() {
  const toast = useToast();
  const query = useAsync(() => listNotifications(100), []);
  const rows = query.data ?? [];
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const visible = rows.filter((row) => filter === "all" || !row.is_read);
  const unread = rows.filter((row) => !row.is_read).length;

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      toast({ title: "All notifications marked as read" });
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Notifications"
        description="New consultation requests and important events."
        actions={
          <AdminButton variant="secondary" icon={CheckCheck} onClick={() => void markAll()} disabled={unread === 0}>
            Mark all as read
          </AdminButton>
        }
      />
      <Card padded={false}>
        <div className="border-b border-[#E3EAF3] p-4">
          <Tabs
            tabs={[
              { key: "all", label: "All", count: rows.length },
              { key: "unread", label: "Unread", count: unread },
            ]}
            value={filter}
            onChange={(key) => setFilter(key as "all" | "unread")}
            className="w-fit"
          />
        </div>
        {query.error ? (
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        ) : query.loading && !query.data ? (
          <TableSkeleton rows={5} cols={3} />
        ) : visible.length === 0 ? (
          <EmptyState icon={Bell} title={filter === "unread" ? "You're all caught up" : "No notifications"} description="You will be notified here when a new consultation request is received." />
        ) : (
          <ul className="divide-y divide-[#EEF3F8]">
            {visible.map((row) => {
              const meta = (row.metadata ?? {}) as { reference?: string; client_name?: string; service?: string };
              const target = row.entity_type === "consultation" && row.entity_id ? `/admin/consultations/${row.entity_id}` : null;
              return (
                <li key={row.id} className={cn("flex items-start gap-3 px-5 py-4", !row.is_read && "bg-royal/[0.04]")}>
                  <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", row.is_read ? "bg-slate-300" : "bg-gold")} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{row.title}</p>
                    {row.body && <p className="mt-0.5 text-sm text-slate-600">{row.body}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {meta.reference && <Badge tone="navy">{meta.reference}</Badge>}
                      {meta.service && <span>{meta.service}</span>}
                      <span title={formatDateTime(row.created_at)}>{timeAgo(row.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {target && (
                      <Link to={target} onClick={() => !row.is_read && void markRead(row.id)}>
                        <AdminButton variant="secondary" size="xs">
                          Open
                        </AdminButton>
                      </Link>
                    )}
                    {!row.is_read && (
                      <AdminButton variant="ghost" size="xs" onClick={() => void markRead(row.id)}>
                        Mark read
                      </AdminButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

/* ====================================================== users & roles */

export function UsersPage() {
  const toast = useToast();
  const { isSuperAdmin, user, refreshProfile } = useAuth();
  const [tab, setTab] = useState("users");
  const profiles = useAsync(listProfiles, []);
  const roles = useAsync(listRoles, []);
  const permissions = useAsync(listPermissions, []);
  const rolePermissions = useAsync(listRolePermissions, []);
  const [busy, setBusy] = useState<string | null>(null);

  const superRoleId = roles.data?.find((role) => role.key === "super_admin")?.id;

  const changeRole = async (profileId: string, roleId: string) => {
    setBusy(profileId);
    try {
      await updateProfile(profileId, { role_id: roleId || null });
      toast({ title: "Role updated" });
      await profiles.refetch(true);
      if (profileId === user?.id) await refreshProfile();
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (profileId: string, value: boolean) => {
    setBusy(profileId);
    try {
      await updateProfile(profileId, { is_active: value });
      toast({ title: value ? "User activated" : "User deactivated" });
      await profiles.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const togglePermission = async (roleId: string, permissionId: string, granted: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setBusy(key);
    try {
      await setRolePermission(roleId, permissionId, granted);
      await rolePermissions.refetch(true);
    } catch (issue) {
      toast({ title: "Update failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, NonNullable<typeof permissions.data>>();
    (permissions.data ?? []).forEach((permission) => {
      map.set(permission.module, [...(map.get(permission.module) ?? []), permission]);
    });
    return [...map.entries()];
  }, [permissions.data]);

  const granted = new Set((rolePermissions.data ?? []).map((row) => `${row.role_id}-${row.permission_id}`));
  const roleList = roles.data ?? [];

  return (
    <>
      <PageHeader eyebrow="System" title="Users & Roles" description="Approve team members, assign roles and configure what each role can do." />
      <Tabs
        className="mb-4 w-fit"
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "users", label: "Users", count: profiles.data?.length },
          { key: "roles", label: "Roles & Permissions" },
        ]}
      />

      {tab === "users" && (
        <Card padded={false}>
          <div className="border-b border-[#E3EAF3] px-5 py-3 text-xs text-slate-500">
            New team members create an account via <span className="font-semibold text-ink">/admin/login → Request access</span>. They appear here as inactive until you activate them and assign a role.
          </div>
          {profiles.error ? (
            <ErrorState message={profiles.error} onRetry={() => void profiles.refetch()} />
          ) : profiles.loading && !profiles.data ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Last login</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3F8]">
                  {(profiles.data ?? []).map((profile) => {
                    const isSelf = profile.id === user?.id;
                    const isSuperRow = profile.role_id === superRoleId;
                    const locked = (isSuperRow && !isSuperAdmin) || busy === profile.id;
                    return (
                      <tr key={profile.id} className="hover:bg-[#F9FBFD]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={profile.full_name ?? profile.email} size="sm" />
                            <div>
                              <p className="font-semibold text-ink">
                                {profile.full_name ?? "—"} {isSelf && <span className="text-xs font-normal text-slate-500">(you)</span>}
                              </p>
                              <p className="text-xs text-slate-500">{profile.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Select className="h-8 w-48 py-1 text-xs" value={profile.role_id ?? ""} disabled={locked || isSelf} onChange={(event) => void changeRole(profile.id, event.target.value)} aria-label="Role">
                            <option value="">No role</option>
                            {roleList.map((role) => (
                              <option key={role.id} value={role.id} disabled={role.key === "super_admin" && !isSuperAdmin}>
                                {role.name}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-3 py-3">
                          <Toggle size="sm" checked={profile.is_active} disabled={locked || isSelf} onChange={(value) => void toggleActive(profile.id, value)} label={profile.is_active ? "Active" : "Inactive"} />
                        </td>
                        <td className="px-3 py-3 text-slate-500">{profile.last_login_at ? timeAgo(profile.last_login_at) : "Never"}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateTime(profile.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "roles" && (
        <Card padded={false}>
          <div className="flex items-start gap-3 border-b border-[#E3EAF3] px-5 py-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-royal" />
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-ink">Permission matrix</p>
              <p className="text-xs">Super Admin always has every permission. {isSuperAdmin ? "Tick a box to grant a permission to a role; changes are enforced by the database immediately." : "Only a Super Admin can change permissions."}</p>
            </div>
          </div>
          {permissions.error || roles.error ? (
            <ErrorState message={permissions.error ?? roles.error ?? ""} onRetry={() => void Promise.all([permissions.refetch(), roles.refetch()])} />
          ) : permissions.loading || roles.loading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-semibold">Permission</th>
                    {roleList.map((role) => (
                      <th key={role.id} className="px-3 py-3 text-center font-semibold">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(([module, items]) => (
                    <GroupRows key={module} module={module} items={items} roles={roleList} granted={granted} busy={busy} editable={isSuperAdmin} onToggle={togglePermission} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function GroupRows({
  module,
  items,
  roles,
  granted,
  busy,
  editable,
  onToggle,
}: {
  module: string;
  items: { id: string; key: string; description: string | null }[];
  roles: { id: string; key: string; name: string }[];
  granted: Set<string>;
  busy: string | null;
  editable: boolean;
  onToggle: (roleId: string, permissionId: string, granted: boolean) => void;
}) {
  return (
    <>
      <tr className="border-y border-[#EEF3F8] bg-[#F4F7FB]">
        <td colSpan={roles.length + 1} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {humanize(module)}
        </td>
      </tr>
      {items.map((permission) => (
        <tr key={permission.id} className="border-b border-[#EEF3F8]">
          <td className="px-4 py-2.5">
            <p className="font-medium text-ink">{permission.key}</p>
            {permission.description && <p className="text-xs text-slate-500">{permission.description}</p>}
          </td>
          {roles.map((role) => {
            const isSuper = role.key === "super_admin";
            const key = `${role.id}-${permission.id}`;
            const checked = isSuper || granted.has(key);
            return (
              <td key={role.id} className="px-3 py-2.5 text-center">
                <input type="checkbox" checked={checked} disabled={isSuper || !editable || busy === key} onChange={(event) => onToggle(role.id, permission.id, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-royal disabled:opacity-50" aria-label={`${role.name}: ${permission.key}`} />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

/* ======================================================== audit logs */

const actionTone: Record<string, "gray" | "blue" | "green" | "red" | "amber" | "purple" | "navy" | "gold"> = {
  login: "green",
  logout: "gray",
  create: "blue",
  update: "amber",
  delete: "red",
  status_change: "purple",
  role_change: "navy",
  content_update: "amber",
  settings_update: "gold",
};

export function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const pageSize = 25;
  const query = useAsync(() => listAuditLogs({ page, pageSize, action, resource }), [page, action, resource]);
  const profiles = useAsync(listProfiles, []);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [action, resource]);

  const actorName = (id: string | null) => {
    if (!id) return "System / website";
    const profile = profiles.data?.find((item) => item.id === id);
    return profile?.full_name ?? profile?.email ?? "Staff";
  };

  const resources = ["consultations", "consultation_notes", "consultation_attachments", "services", "service_questions", "faqs", "blog_posts", "pages", "page_sections", "media", "site_settings", "seo_settings", "profiles", "role_permissions", "leads", "clients", "auth"];

  return (
    <>
      <PageHeader eyebrow="System" title="Activity Logs" description="A tamper-evident record of logins, changes and administrative actions." />
      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-[#E3EAF3] p-4 sm:flex-row">
          <Select value={action} onChange={(event) => setAction(event.target.value)} className="sm:w-48" aria-label="Filter by action">
            <option value="">All actions</option>
            {Object.keys(actionTone).map((key) => (
              <option key={key} value={key}>
                {humanize(key)}
              </option>
            ))}
          </Select>
          <Select value={resource} onChange={(event) => setResource(event.target.value)} className="sm:w-56" aria-label="Filter by resource">
            <option value="">All resources</option>
            {resources.map((item) => (
              <option key={item} value={item}>
                {humanize(item)}
              </option>
            ))}
          </Select>
        </div>
        {query.error ? (
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        ) : query.loading && !query.data ? (
          <TableSkeleton rows={10} cols={4} />
        ) : (query.data?.rows.length ?? 0) === 0 ? (
          <EmptyState icon={ScrollText} title="No activity recorded" description="Actions performed in the admin portal and on the website will be listed here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold">Action</th>
                  <th className="px-3 py-3 font-semibold">Resource</th>
                  <th className="px-3 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F8]">
                {(query.data?.rows ?? []).map((row) => {
                  const details = row.details ?? {};
                  const summary = typeof details.summary === "string" ? details.summary : null;
                  const open = expanded === row.id;
                  return (
                    <tr key={row.id} className="align-top hover:bg-[#F9FBFD]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {row.actor_id ? <Avatar name={actorName(row.actor_id)} size="sm" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserRound className="h-3.5 w-3.5" /></span>}
                          <span className="font-medium text-ink">{actorName(row.actor_id)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={actionTone[row.action] ?? "gray"}>{humanize(row.action)}</Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        <p>{humanize(row.resource_type)}</p>
                        {row.resource_id && <p className="max-w-[160px] truncate font-mono text-[11px] text-slate-400">{row.resource_id}</p>}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {summary && <p className="font-medium text-ink">{summary}</p>}
                        {Object.keys(details).length > 0 && (
                          <>
                            <button type="button" className="text-xs font-semibold text-royal hover:text-navy" onClick={() => setExpanded(open ? null : row.id)}>
                              {open ? "Hide details" : "Show details"}
                            </button>
                            {open && <pre className="mt-1 max-h-48 max-w-md overflow-auto rounded-lg bg-[#F4F7FB] p-2 text-[11px] text-slate-600">{JSON.stringify(details, null, 2)}</pre>}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(row.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={query.data?.total ?? 0} onChange={setPage} />
      </Card>
    </>
  );
}

