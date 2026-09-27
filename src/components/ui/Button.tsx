import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

type Variant = "gold" | "navy" | "outline" | "ghost-light" | "white";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 select-none whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy shadow-gold hover:bg-gold-dark hover:-translate-y-0.5 active:translate-y-0",
  navy: "bg-navy text-white hover:bg-deep-blue hover:-translate-y-0.5 active:translate-y-0 shadow-card",
  outline:
    "border border-navy/20 bg-white text-navy hover:border-navy hover:bg-navy hover:text-white hover:-translate-y-0.5 active:translate-y-0",
  "ghost-light":
    "border border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/12 hover:border-white/50 hover:-translate-y-0.5 active:translate-y-0",
  white: "bg-white text-navy hover:bg-light hover:-translate-y-0.5 active:translate-y-0 shadow-card",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm sm:text-[15px]",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { to: string; href?: never } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "to" | "className" | "children"
  >;
type ButtonAsAnchor = CommonProps & { href: string; to?: never } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href" | "className" | "children"
  >;
type ButtonAsButton = CommonProps & { to?: never; href?: never } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton;

export function Button(props: ButtonProps) {
  const { variant = "gold", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("to" in props && props.to) {
    const { to, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonAsButton;
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
