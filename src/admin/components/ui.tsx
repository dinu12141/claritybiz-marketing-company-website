import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Info, LoaderCircle, Search, TriangleAlert, X } from "lucide-react";
import { PRIORITIES, CONSULTATION_STATUSES, type Tone } from "@/data/consultation";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------- buttons */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "xs" | "sm" | "md";
  loading?: boolean;
  icon?: LucideIcon;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-deep-blue shadow-sm",
  secondary: "border border-[#D9E2EC] bg-white text-ink hover:bg-[#F4F7FB]",
  ghost: "text-slate-600 hover:bg-[#EEF3F8] hover:text-navy",
  danger: "bg-red-600 text-white hover:bg-red-700",
  gold: "bg-gold text-navy hover:bg-gold-dark shadow-sm",
};

const buttonSizes = {
  xs: "h-8 px-2.5 text-xs gap-1.5 rounded-lg",
  sm: "h-9 px-3.5 text-sm gap-2 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
};

export function AdminButton({ variant = "primary", size = "sm", loading, icon: Icon, className, children, disabled, type = "button", ...rest }: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal/40 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- cards */

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <div className={cn("rounded-2xl border border-[#E3EAF3] bg-white shadow-[0_1px_2px_rgba(16,36,58,0.04)]", padded && "p-5", className)}>{children}</div>;
}

export function CardHeader({ title, description, actions, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-royal">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- badges */

const toneClasses: Record<Tone, string> = {
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  cyan: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  gold: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  amber: "bg-orange-50 text-orange-700 ring-orange-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
  navy: "bg-navy/10 text-navy ring-navy/15",
};

export const toneDot: Record<Tone, string> = {
  gray: "bg-slate-400",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  gold: "bg-gold",
  amber: "bg-orange-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  purple: "bg-violet-500",
  navy: "bg-navy",
};

export function Badge({ children, tone = "gray", className, dot }: { children: ReactNode; tone?: Tone; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap", toneClasses[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = CONSULTATION_STATUSES.find((item) => item.key === status);
  return (
    <Badge tone={meta?.tone ?? "gray"} dot>
      {meta?.label ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const meta = PRIORITIES.find((item) => item.key === priority);
  return <Badge tone={meta?.tone ?? "gray"}>{meta?.label ?? priority}</Badge>;
}

/* ------------------------------------------------------------- stat card */

export function StatCard({ label, value, icon: Icon, hint, tone = "navy", loading }: { label: string; value: ReactNode; icon: LucideIcon; hint?: ReactNode; tone?: Tone; loading?: boolean }) {
  return (
    <Card className="flex items-start gap-4">
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset", toneClasses[tone])}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        {loading ? <Skeleton className="mt-2 h-7 w-16" /> : <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>}
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------- forms */

export const inputClass =
  "w-full rounded-lg border border-[#D9E2EC] bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-royal focus:outline-none focus:ring-2 focus:ring-royal/20 disabled:bg-slate-50 disabled:text-slate-400";

export function Field({ label, htmlFor, hint, error, required, children, className }: { label: ReactNode; htmlFor?: string; hint?: ReactNode; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-gold-dark">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
          <CircleAlert className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-[96px] resize-y", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, "pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label, disabled, size = "md" }: { checked: boolean; onChange: (value: boolean) => void; label?: string; disabled?: boolean; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const shift = size === "sm" ? "translate-x-4" : "translate-x-5";
  return (
    <label className={cn("inline-flex items-center gap-2", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative inline-flex shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal/40", dims, checked ? "bg-emerald-500" : "bg-slate-300")}
      >
        <span className={cn("inline-block transform rounded-full bg-white shadow transition-transform", knob, checked ? shift : "translate-x-0.5")} />
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn(inputClass, "pl-9")} aria-label={placeholder} />
    </div>
  );
}

/* --------------------------------------------------------------- states */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: cols }).map((__, col) => (
            <Skeleton key={col} className={cn("h-9 flex-1", col === 0 && "max-w-[120px]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, compact }: { icon: LucideIcon; title: string; description?: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-16")}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3F8] text-royal ring-1 ring-inset ring-[#E3EAF3]">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = "Something went wrong" }: { message: string; onRetry?: () => void; title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
        <TriangleAlert className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && (
        <AdminButton variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </AdminButton>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- modals */

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" | "xl" }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn("relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl", width)}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E3EAF3] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E3EAF3] bg-[#F9FBFD] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "danger", loading, onConfirm, onCancel }: { open: boolean; title: string; message: ReactNode; confirmLabel?: string; tone?: "danger" | "primary"; loading?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <AdminButton variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </AdminButton>
          <AdminButton variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <div className="flex gap-3 text-sm text-slate-600">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone === "danger" ? "bg-red-50 text-red-600" : "bg-blue-50 text-royal")}>
          {tone === "danger" ? <TriangleAlert className="h-4.5 w-4.5" /> : <Info className="h-4.5 w-4.5" />}
        </span>
        <div>{message}</div>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- tabs */

export function Tabs({ tabs, value, onChange, className }: { tabs: { key: string; label: string; count?: number }[]; value: string; onChange: (key: string) => void; className?: string }) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto rounded-xl bg-[#EEF3F8] p-1", className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn("inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors", active ? "bg-white text-navy shadow-sm" : "text-slate-600 hover:text-navy")}
          >
            {tab.label}
            {typeof tab.count === "number" && <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-navy/10 text-navy" : "bg-slate-200 text-slate-600")}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------- pagination */

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E3EAF3] px-4 py-3 text-sm text-slate-500 sm:flex-row">
      <span>
        Showing <span className="font-semibold text-ink">{from}–{to}</span> of <span className="font-semibold text-ink">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <AdminButton variant="secondary" size="xs" icon={ChevronLeft} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" />
        <span className="px-2 text-xs font-semibold text-ink">
          Page {page} / {pages}
        </span>
        <AdminButton variant="secondary" size="xs" icon={ChevronRight} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page" />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- avatar */

export function Avatar({ name, size = "md", className }: { name?: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-sm" }[size];
  const letters = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-bold text-gold", dims, className)}>{letters || "?"}</span>;
}

/* --------------------------------------------------------------- toasts */

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };
type ToastInput = { title: string; description?: string; tone?: ToastTone };

const ToastContext = createContext<{ toast: (input: ToastInput) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++counter.current;
      setItems((current) => [...current, { id, title: input.title, description: input.description, tone: input.tone ?? "success" }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-[#E3EAF3] bg-white p-3.5 shadow-xl">
            <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", item.tone === "success" && "bg-emerald-50 text-emerald-600", item.tone === "error" && "bg-red-50 text-red-600", item.tone === "info" && "bg-blue-50 text-royal")}>
              {item.tone === "success" ? <CircleCheck className="h-4 w-4" /> : item.tone === "error" ? <CircleAlert className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              {item.description && <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(item.id)} className="text-slate-400 hover:text-ink" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context.toast;
}
