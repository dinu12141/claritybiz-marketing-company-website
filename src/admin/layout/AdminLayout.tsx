import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Briefcase,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { subscribeToNotifications, unreadNotificationCount } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { Avatar, useToast } from "@/admin/components/ui";
import { LogoImage } from "@/components/ui/Logo";
import { site } from "@/data/site";
import { cn } from "@/utils/cn";

type NavChild = { label: string; to: string };
type NavEntry = { label: string; to?: string; icon: LucideIcon; permission: string; children?: NavChild[]; badge?: number };
type NavGroup = { title?: string; items: NavEntry[] };

const CONTENT_CHILDREN: NavChild[] = [
  { label: "Homepage", to: "/admin/content/home" },
  { label: "About", to: "/admin/content/about" },
  { label: "Services", to: "/admin/content/services" },
  { label: "Why Choose Us", to: "/admin/content/why-choose-us" },
  { label: "FAQ", to: "/admin/content/faq" },
  { label: "Contact", to: "/admin/content/contact" },
];

function buildNav(unread: number): NavGroup[] {
  return [
    { items: [{ label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard.view" }] },
    {
      title: "CRM",
      items: [
        { label: "Consultations", to: "/admin/consultations", icon: Inbox, permission: "consultations.view" },
        { label: "Leads / Clients", to: "/admin/leads", icon: Users, permission: "leads.view" },
      ],
    },
    {
      title: "Website",
      items: [
        { label: "Website Content", icon: FileText, permission: "content.view", children: CONTENT_CHILDREN },
        { label: "Services", to: "/admin/services", icon: Briefcase, permission: "services.manage" },
        { label: "Blog / Insights", to: "/admin/blog", icon: Newspaper, permission: "blog.manage" },
        { label: "Media Library", to: "/admin/media", icon: Images, permission: "media.view" },
        { label: "SEO", to: "/admin/seo", icon: Globe, permission: "seo.manage" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Notifications", to: "/admin/notifications", icon: Bell, permission: "notifications.view", badge: unread },
        { label: "Users & Roles", to: "/admin/users", icon: ShieldCheck, permission: "users.manage" },
        { label: "Activity Logs", to: "/admin/activity", icon: ScrollText, permission: "audit.view" },
        { label: "Settings", to: "/admin/settings", icon: Settings, permission: "settings.manage" },
      ],
    },
  ];
}

const linkClass = (active: boolean) =>
  cn(
    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
    active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
  );

function SidebarContent({ unread, onNavigate }: { unread: number; onNavigate?: () => void }) {
  const { can, profile, roleKey, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [contentOpen, setContentOpen] = useState(location.pathname.startsWith("/admin/content"));

  useEffect(() => {
    if (location.pathname.startsWith("/admin/content")) setContentOpen(true);
  }, [location.pathname]);

  const groups = buildNav(unread)
    .map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <LogoImage size={40} priority className="ring-2 ring-gold/60" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-extrabold text-white">{site.shortName}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Admin">
        {groups.map((group, index) => (
          <div key={group.title ?? index}>
            {group.title && <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{group.title}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                if (item.children) {
                  const active = location.pathname.startsWith("/admin/content");
                  return (
                    <li key={item.label}>
                      <button type="button" onClick={() => setContentOpen((open) => !open)} className={cn(linkClass(active), "w-full")} aria-expanded={contentOpen}>
                        <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.9} />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", contentOpen && "rotate-180")} />
                      </button>
                      <ul className={cn("ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pl-3", !contentOpen && "hidden")}>
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              onClick={onNavigate}
                              className={({ isActive }) =>
                                cn("block rounded-md px-3 py-1.5 text-[13px] transition-colors", isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white")
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
                return (
                  <li key={item.to}>
                    <NavLink to={item.to!} onClick={onNavigate} className={({ isActive }) => linkClass(isActive)}>
                      {({ isActive }) => (
                        <>
                          {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold" aria-hidden="true" />}
                          <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.9} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge ? <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold text-navy">{item.badge > 99 ? "99+" : item.badge}</span> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={profile?.full_name ?? profile?.email} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{profile?.full_name || profile?.email}</p>
            <p className="truncate text-[11px] text-white/50">{profile?.role?.name ?? roleKey ?? "—"}</p>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white">
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.9} /> Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const toast = useToast();
  const { can } = useAuth();

  const refreshUnread = useCallback(() => {
    if (!can("notifications.view")) return;
    unreadNotificationCount()
      .then(setUnread)
      .catch(() => undefined);
  }, [can]);

  useEffect(() => {
    refreshUnread();
    const interval = window.setInterval(refreshUnread, 60000);
    return () => window.clearInterval(interval);
  }, [refreshUnread]);

  useEffect(() => {
    refreshUnread();
  }, [location.pathname, refreshUnread]);

  useEffect(() => {
    if (!can("notifications.view")) return;
    const unsubscribe = subscribeToNotifications((row) => {
      setUnread((count) => count + 1);
      toast({ title: row.title, description: row.body ?? undefined, tone: "info" });
    });
    return unsubscribe;
  }, [can, toast]);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] bg-navy-deep lg:block">
        <SidebarContent unread={unread} />
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", !drawerOpen && "pointer-events-none")} aria-hidden={!drawerOpen}>
        <div className={cn("absolute inset-0 bg-navy-deep/60 backdrop-blur-sm transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setDrawerOpen(false)} />
        <div className={cn("absolute inset-y-0 left-0 w-[280px] bg-navy-deep shadow-2xl transition-transform duration-300", drawerOpen ? "translate-x-0" : "-translate-x-full")}>
          <button type="button" onClick={() => setDrawerOpen(false)} className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
          <SidebarContent unread={unread} onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      {/* Main */}
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#E3EAF3] bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3EAF3] text-navy lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="font-semibold text-ink">{site.name}</span>
              <span className="text-slate-300">/</span>
              <span>Business Management Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="hidden h-9 items-center gap-1.5 rounded-lg border border-[#E3EAF3] px-3 text-xs font-semibold text-slate-600 hover:bg-[#F4F7FB] hover:text-navy sm:inline-flex">
              <ExternalLink className="h-3.5 w-3.5" /> View website
            </Link>
            {can("notifications.view") && (
              <Link to="/admin/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3EAF3] text-slate-600 hover:bg-[#F4F7FB] hover:text-navy" aria-label={`Notifications (${unread} unread)`}>
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy">{unread > 99 ? "99+" : unread}</span>}
              </Link>
            )}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
