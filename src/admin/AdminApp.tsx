import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, Database, KeyRound, Lock, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Card, Field, Input, ToastProvider } from "@/admin/components/ui";
import { AdminLayout } from "@/admin/layout/AdminLayout";
import { DashboardPage } from "@/admin/pages/DashboardPage";
import { ConsultationsPage } from "@/admin/pages/ConsultationsPage";
import { ConsultationDetailPage } from "@/admin/pages/ConsultationDetailPage";
import { LeadsPage } from "@/admin/pages/LeadsPage";
import { ContentPage } from "@/admin/pages/ContentPage";
import { ServiceEditorPage, ServicesAdminPage } from "@/admin/pages/ServicesAdmin";
import { BlogEditorPage, BlogListPage } from "@/admin/pages/BlogAdmin";
import { MediaPage } from "@/admin/pages/MediaPage";
import { ActivityLogsPage, NotificationsPage, SeoPage, SettingsPage, UsersPage } from "@/admin/pages/SystemPages";
import { LogoImage } from "@/components/ui/Logo";
import { site } from "@/data/site";
import { isSupabaseConfigured } from "@/lib/supabase";

/* ------------------------------------------------------------ shells */

function AdminSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
      <div className="flex flex-col items-center gap-4">
        <LogoImage size={64} priority className="animate-pulse ring-2 ring-gold/60" />
        <p className="text-sm font-medium text-slate-500">Loading admin portal…</p>
      </div>
    </div>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#F4F7FB] lg:grid-cols-[1.1fr_1fr]">
      <div className="gradient-navy on-dark relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <LogoImage size={52} priority className="ring-2 ring-gold/60" />
          <div>
            <p className="font-display text-lg font-extrabold">{site.shortName}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">Admin Portal</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="eyebrow text-cyan">Business Management Platform</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight text-white">Consultations, content and clients — in one secure place.</h2>
          <ul className="mt-6 space-y-3 text-sm text-white/75">
            {["Consultation intake & CRM pipeline", "Website content, services, FAQ & insights", "Role-based access with full audit trail"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-gold" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">
          © {site.copyrightYear} {site.name}
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoImage size={44} priority className="ring-2 ring-gold/60" />
            <div>
              <p className="font-display text-base font-extrabold text-navy">{site.shortName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-royal">Admin Portal</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <Link to="/" className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- setup */

export function SetupPage() {
  const steps = [
    "Create a Supabase project and open the SQL editor.",
    "Run supabase/schema.sql from this repository (tables, RLS policies, storage buckets, seeds).",
    "Copy the project URL and anon key into a .env file as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    "Rebuild and deploy. The first account that signs up becomes the Super Admin.",
  ];
  return (
    <AuthShell title="Admin portal not configured" subtitle="Connect a Supabase project to enable authentication, the CMS and the consultation CRM.">
      <Card>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy">
            <Database className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-ink">Setup checklist</p>
        </div>
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-lg bg-[#F4F7FB] px-3 py-2 text-xs text-slate-500">
          The public website continues to work with its built-in content until the connection is configured. Never place a service-role key in the frontend.
        </p>
      </Card>
    </AuthShell>
  );
}

/* ------------------------------------------------------------- login */

function LoginPage() {
  const { status, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "ready") {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from.startsWith("/admin") ? from : "/admin/dashboard"} replace />;
  }
  if (status === "pending") return <PendingApproval />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    if (mode === "signin") {
      const problem = await signIn(email.trim(), password);
      setBusy(false);
      if (problem) setError(problem);
      else navigate("/admin/dashboard", { replace: true });
    } else {
      if (fullName.trim().length < 2) {
        setBusy(false);
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 8) {
        setBusy(false);
        setError("Password must be at least 8 characters.");
        return;
      }
      const problem = await signUp(email.trim(), password, fullName.trim());
      setBusy(false);
      if (problem) setError(problem);
      else setInfo("Account created. If email confirmation is enabled, confirm your email first. An administrator must approve your access before you can sign in.");
    }
  };

  return (
    <AuthShell title={mode === "signin" ? "Sign in" : "Request access"} subtitle={mode === "signin" ? "Enter your credentials to access the admin portal." : "Create an account; a super admin will assign your role."}>
      <Card>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <Field label="Full name" htmlFor="login-name" required>
              <Input id="login-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />
            </Field>
          )}
          <Field label="Email" htmlFor="login-email" required>
            <Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </Field>
          <Field label="Password" htmlFor="login-password" required hint={mode === "signup" ? "Minimum 8 characters." : undefined}>
            <Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} required />
          </Field>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              {info}
            </p>
          )}
          <AdminButton type="submit" size="md" className="w-full" loading={busy} icon={mode === "signin" ? LogIn : UserPlus}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </AdminButton>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-xs font-semibold text-royal hover:text-navy"
        >
          {mode === "signin" ? "Need an account? Request access" : "Already have an account? Sign in"}
        </button>
      </Card>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" /> Protected by Supabase Auth and row-level security
      </p>
    </AuthShell>
  );
}

function PendingApproval() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  return (
    <AuthShell title="Access pending approval" subtitle="Your account exists but has not been activated yet.">
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700">
            <KeyRound className="h-5 w-5" />
          </span>
          <div className="text-sm text-slate-600">
            <p>
              Signed in as <span className="font-semibold text-ink">{profile?.email}</span>. A super admin needs to activate your account and assign a role before you can use the portal.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <AdminButton variant="secondary" onClick={() => void refreshProfile()}>
                Check again
              </AdminButton>
              <AdminButton
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  navigate("/admin/login", { replace: true });
                }}
              >
                Sign out
              </AdminButton>
            </div>
          </div>
        </div>
      </Card>
    </AuthShell>
  );
}

/* ------------------------------------------------------------- guards */

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <AdminSplash />;
  if (status === "signed_out") return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (status === "pending") return <PendingApproval />;
  return <AdminLayout />;
}

function Guard({ permission, children }: { permission: string; children: ReactNode }) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Lock className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-lg font-bold text-ink">You don't have access to this area</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your role does not include the <code className="rounded bg-slate-100 px-1 text-xs">{permission}</code> permission. Contact a super admin if you need it.
        </p>
        <Link to="/admin/dashboard" className="mt-5 inline-flex text-sm font-semibold text-royal hover:text-navy">
          Back to dashboard
        </Link>
      </Card>
    );
  }
  return <>{children}</>;
}

function AdminNotFound() {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <h1 className="text-lg font-bold text-ink">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">The admin page you requested does not exist.</p>
      <Link to="/admin/dashboard" className="mt-5 inline-flex text-sm font-semibold text-royal hover:text-navy">
        Back to dashboard
      </Link>
    </Card>
  );
}

/* --------------------------------------------------------------- app */

export function AdminApp() {
  if (!isSupabaseConfigured) return <SetupPage />;

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Guard permission="dashboard.view"><DashboardPage /></Guard>} />
            <Route path="consultations" element={<Guard permission="consultations.view"><ConsultationsPage /></Guard>} />
            <Route path="consultations/:id" element={<Guard permission="consultations.view"><ConsultationDetailPage /></Guard>} />
            <Route path="leads" element={<Guard permission="leads.view"><LeadsPage /></Guard>} />
            <Route path="content" element={<Navigate to="home" replace />} />
            <Route path="content/:slug" element={<Guard permission="content.view"><ContentPage /></Guard>} />
            <Route path="services" element={<Guard permission="services.manage"><ServicesAdminPage /></Guard>} />
            <Route path="services/:id" element={<Guard permission="services.manage"><ServiceEditorPage /></Guard>} />
            <Route path="blog" element={<Guard permission="blog.manage"><BlogListPage /></Guard>} />
            <Route path="blog/:id" element={<Guard permission="blog.manage"><BlogEditorPage /></Guard>} />
            <Route path="media" element={<Guard permission="media.view"><MediaPage /></Guard>} />
            <Route path="seo" element={<Guard permission="seo.manage"><SeoPage /></Guard>} />
            <Route path="notifications" element={<Guard permission="notifications.view"><NotificationsPage /></Guard>} />
            <Route path="users" element={<Guard permission="users.manage"><UsersPage /></Guard>} />
            <Route path="activity" element={<Guard permission="audit.view"><ActivityLogsPage /></Guard>} />
            <Route path="settings" element={<Guard permission="settings.manage"><SettingsPage /></Guard>} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
