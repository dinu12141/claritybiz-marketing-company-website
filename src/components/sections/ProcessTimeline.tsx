import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/utils/cn";

export type TimelineStep = {
  number: string;
  title: string;
  description: string;
  icon?: LucideIcon;
};

type ProcessTimelineProps = {
  steps: TimelineStep[];
  tone?: "light" | "dark";
  className?: string;
};

/** Horizontal timeline on desktop, vertical on mobile. */
export function ProcessTimeline({ steps, tone = "light", className }: ProcessTimelineProps) {
  const dark = tone === "dark";
  const cols = steps.length;

  return (
    <ol
      className={cn(
        "relative grid gap-8 lg:gap-6",
        cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
        className,
      )}
    >
      {/* Horizontal connector (desktop) */}
      <div
        className={cn(
          "absolute left-0 right-0 top-7 hidden h-px lg:block",
          dark
            ? "bg-gradient-to-r from-transparent via-white/25 to-transparent"
            : "bg-gradient-to-r from-transparent via-navy/20 to-transparent",
        )}
        aria-hidden="true"
      />
      {/* Vertical connector (mobile) */}
      <div
        className={cn(
          "absolute bottom-6 left-7 top-6 w-px lg:hidden",
          dark ? "bg-white/20" : "bg-navy/15",
        )}
        aria-hidden="true"
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <Reveal as="li" key={step.number} delay={index * 100} className="relative flex gap-5 lg:flex-col lg:gap-0">
            <div
              className={cn(
                "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border font-display text-lg font-extrabold shadow-card",
                dark
                  ? "border-white/15 bg-navy text-gold"
                  : "border-line bg-white text-navy",
              )}
            >
              {Icon ? <Icon className={cn("h-6 w-6", dark ? "text-gold" : "text-royal")} strokeWidth={1.9} /> : step.number}
              <span
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-navy"
                aria-hidden="true"
              >
                {step.number}
              </span>
            </div>
            <div className="pt-1 lg:pt-6">
              <h3 className={cn("text-lg font-bold", dark ? "text-white" : "text-ink")}>
                <span className="sr-only">Step {step.number}: </span>
                {step.title}
              </h3>
              <p className={cn("mt-2 text-[15px] leading-relaxed", dark ? "text-white/70" : "text-muted")}>
                {step.description}
              </p>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
