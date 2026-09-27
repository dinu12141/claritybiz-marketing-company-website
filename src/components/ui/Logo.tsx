import { Link } from "react-router-dom";
import logoUrl from "@/assets/logo.svg";
import { site } from "@/data/site";
import { cn } from "@/utils/cn";

export { logoUrl };

type LogoImageProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** When true, sizing is controlled by className (responsive); `size` only sets intrinsic dimensions. */
  fluid?: boolean;
};

/** The company emblem, rendered at its original 1:1 proportions. */
export function LogoImage({ size = 48, className, priority = false, fluid = false }: LogoImageProps) {
  return (
    <img
      src={logoUrl}
      alt={`${site.name} logo`}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("aspect-square rounded-full object-contain", className)}
      style={fluid ? undefined : { width: size, height: size }}
    />
  );
}

type LogoLockupProps = {
  size?: number;
  tone?: "dark" | "light";
  className?: string;
  withTagline?: boolean;
  linkTo?: string | null;
  priority?: boolean;
};

/** Emblem + wordmark lockup used in the header and footer. */
export function LogoLockup({
  size = 48,
  tone = "dark",
  className,
  withTagline = false,
  linkTo = "/",
  priority = false,
}: LogoLockupProps) {
  const content = (
    <>
      <LogoImage
        size={size}
        priority={priority}
        className="shrink-0 shadow-[0_2px_10px_rgba(6,43,82,0.18)] transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display text-[15px] font-extrabold tracking-tight sm:text-base",
            tone === "dark" ? "text-navy" : "text-white",
          )}
        >
          TV Clarity Capital
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
            tone === "dark" ? "text-royal" : "text-cyan",
          )}
        >
          (Pvt) Ltd
        </span>
        {withTagline && (
          <span
            className={cn(
              "mt-1.5 text-xs font-medium italic",
              tone === "dark" ? "text-muted" : "text-white/70",
            )}
          >
            {site.tagline}
          </span>
        )}
      </span>
    </>
  );

  const classes = cn("group inline-flex items-center gap-3", className);

  if (linkTo === null) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link to={linkTo} className={classes} aria-label={`${site.name} — Home`}>
      {content}
    </Link>
  );
}
