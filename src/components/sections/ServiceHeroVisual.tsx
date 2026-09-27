import { Check } from "lucide-react";
import { LogoImage } from "@/components/ui/Logo";
import type { Service } from "@/data/services";
import { cn } from "@/utils/cn";

type ServiceHeroVisualProps = { service: Service; className?: string };

/** Framed feature photograph used in the hero of each service landing page. */
export function ServiceHeroVisual({ service, className }: ServiceHeroVisualProps) {
  const Icon = service.icon;

  return (
    <div className={cn("relative mx-auto w-full max-w-[440px] p-5", className)} aria-label={service.name}>
      {/* Ambient glow */}
      <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-cyan/25 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-12 -right-8 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />

      {/* Offset gold frame */}
      <div
        className="absolute inset-5 translate-x-4 translate-y-4 rounded-3xl border border-gold/50"
        aria-hidden="true"
      />

      <figure className="relative overflow-hidden rounded-3xl shadow-glow ring-1 ring-white/15">
        <img
          src={service.image.src}
          alt={service.image.alt}
          className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy/15 to-navy/10"
          aria-hidden="true"
        />

        {/* Service chip */}
        <span className="glass absolute left-4 top-4 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-white shadow-lg">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-navy">
            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          {service.shortName}
        </span>

        {/* Brand mark */}
        <LogoImage size={44} className="absolute right-4 top-4 ring-2 ring-white/80 shadow-lg" />

        <figcaption className="absolute inset-x-4 bottom-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Key services</p>
            <ul className="mt-2.5 space-y-1.5">
              {service.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm font-medium text-white">
                  <Check className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={3} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
