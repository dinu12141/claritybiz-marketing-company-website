import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  const light = tone === "light";
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow mb-4", light ? "text-cyan" : "text-royal")}>
          <span className={cn("h-px w-6", light ? "bg-gold" : "bg-gold-dark")} aria-hidden="true" />
          {eyebrow}
          {align === "center" && (
            <span className={cn("h-px w-6", light ? "bg-gold" : "bg-gold-dark")} aria-hidden="true" />
          )}
        </span>
      )}
      <Heading
        className={cn(
          "text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]",
          light ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Heading>
      {subtitle && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            light ? "text-white/75" : "text-muted",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
