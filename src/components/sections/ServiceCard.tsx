import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui/Reveal";
import type { Service } from "@/data/services";
import { cn } from "@/utils/cn";

type ServiceCardProps = {
  service: Service;
  index?: number;
  variant?: "compact" | "detailed";
  className?: string;
};

export function ServiceCard({ service, index = 0, variant = "compact", className }: ServiceCardProps) {
  const Icon = service.icon;
  const detailed = variant === "detailed";

  return (
    <Reveal delay={index * 80} className={cn("h-full", className)}>
      <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
        {/* Photographic header */}
        <div className={cn("relative overflow-hidden", detailed ? "aspect-[2/1]" : "aspect-[16/9]")}>
          <img
            src={service.image.src}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-navy/5"
            aria-hidden="true"
          />
          <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-display text-xs font-bold text-white backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="absolute -bottom-7 left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-navy shadow-gold ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1">
            <Icon className="h-7 w-7" strokeWidth={1.8} />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 pt-11 sm:p-7 sm:pt-12">
          <h3 className="text-xl font-bold text-ink">
            <Link to={service.path} className="after:absolute after:inset-0 focus-visible:outline-none">
              {service.name}
            </Link>
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{service.description}</p>

          <ul className={cn("mt-5 space-y-2", detailed && "grid gap-2 sm:grid-cols-2 sm:space-y-0")}>
            {service.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/80">
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-royal transition-colors group-hover:text-navy">
            Learn More
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Reveal>
  );
}
