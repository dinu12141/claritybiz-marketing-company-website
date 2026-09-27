import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { ChartLines, Particles } from "@/components/decor/Backgrounds";
import { cms, getContent, text } from "@/content/cms";
import type { SiteImage } from "@/data/images";
import { cn } from "@/utils/cn";

export type Crumb = { label: string; to?: string };

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  visual?: ReactNode;
  /** Photographic backdrop, rendered beneath brand overlays. */
  image?: SiteImage;
  /** "photo" shows the backdrop crisply; "blurred" turns it into a soft colour wash behind a foreground visual. */
  backdrop?: "photo" | "blurred";
  /** Also show the visual on small screens (stacked beneath the text). */
  visualMobile?: boolean;
  className?: string;
  compact?: boolean;
};

/** Maps the current route to a CMS page slug so hero copy can be managed from the admin portal. */
function useCmsHero() {
  const { pathname } = useLocation();
  const slug = pathname === "/" ? "home" : pathname.replace(/^\/+|\/+$/g, "");
  if (!cms.pages[slug]) return null;
  const content = getContent(slug, "hero");
  return {
    eyebrow: text(content, "eyebrow"),
    title: text(content, "title"),
    text: text(content, "text"),
  };
}

/** Shared dark hero for inner pages. */
export function PageHero({
  eyebrow,
  title,
  text: body,
  crumbs,
  actions,
  visual,
  image,
  backdrop = "photo",
  visualMobile = false,
  className,
  compact,
}: PageHeroProps) {
  const blurred = backdrop === "blurred";
  const cmsHero = useCmsHero();
  const finalEyebrow = cmsHero?.eyebrow || eyebrow;
  const finalTitle = cmsHero?.title || title;
  const finalText = cmsHero?.text || body;

  return (
    <section className={cn("gradient-hero on-dark relative overflow-hidden text-white", className)}>
      {image && (
        <>
          <img
            src={image.src}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center",
              blurred ? "scale-110 opacity-35 blur-md" : "opacity-60",
            )}
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy/90 to-navy/75 lg:via-navy/85 lg:to-navy/45"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-transparent to-navy-deep/25"
            aria-hidden="true"
          />
        </>
      )}
      <div className={cn("bg-grid-dark absolute inset-0", image ? "opacity-30" : "opacity-60")} aria-hidden="true" />
      <ChartLines className={cn("bottom-0 left-0 h-[70%] w-full", image ? "opacity-35" : "opacity-60")} />
      <Particles count={10} />
      <div
        className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-white/5"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full border border-gold/10"
        aria-hidden="true"
      />

      <Container className={cn("relative", compact ? "py-14 sm:py-16 lg:py-20" : "py-16 sm:py-20 lg:py-28")}>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
              <li>
                <Link to="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-gold">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white/90" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={cn("grid items-center gap-12 lg:gap-10", visual && "lg:grid-cols-[1.15fr_1fr]")}>
          <div className="max-w-3xl">
            {finalEyebrow && (
              <span className="eyebrow text-cyan">
                <span className="h-px w-6 bg-gold" aria-hidden="true" />
                {finalEyebrow}
              </span>
            )}
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              {finalTitle}
            </h1>
            {finalText && <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{finalText}</p>}
            {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {visual && (
            <div className={cn("relative", visualMobile ? "block" : "hidden lg:block")}>{visual}</div>
          )}
        </div>
      </Container>
    </section>
  );
}
