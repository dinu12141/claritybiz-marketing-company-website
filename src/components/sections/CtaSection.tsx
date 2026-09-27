import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LogoImage } from "@/components/ui/Logo";
import { ChartLines, Particles } from "@/components/decor/Backgrounds";
import { images } from "@/data/images";
import { site } from "@/data/site";
import { cn } from "@/utils/cn";

type CtaSectionProps = {
  title?: string;
  text?: string;
  primaryLabel?: string;
  primaryTo?: string;
  className?: string;
};

/** Reusable premium dark-blue call-to-action band. */
export function CtaSection({
  title = "Let's Build a Stronger Business Together",
  text = "Have a business, financial or technology requirement? Talk to TV Clarity Capital today.",
  primaryLabel = "Request a Consultation",
  primaryTo = "/consultation",
  className,
}: CtaSectionProps) {
  return (
    <section className={cn("relative py-6 sm:py-10", className)} aria-labelledby="cta-heading">
      <Container>
        <Reveal className="gradient-navy on-dark relative overflow-hidden rounded-3xl px-6 py-14 text-white shadow-[0_30px_80px_-30px_rgba(6,43,82,0.6)] sm:px-12 lg:px-16 lg:py-20">
          <img
            src={images.heroAbstract.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-right opacity-45"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy/80 to-navy/30" aria-hidden="true" />
          <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden="true" />
          <ChartLines className="bottom-0 right-0 h-full w-[70%] opacity-70" />
          <Particles count={8} />
          <div
            className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-cyan/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden="true" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4">
                <LogoImage size={56} className="ring-2 ring-gold/60" />
                <span className="text-sm font-semibold italic text-gold">{site.tagline}</span>
              </div>
              <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                {title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button href={site.phoneHref} size="lg">
                <Phone className="h-4.5 w-4.5" /> Call {site.phoneDisplay}
              </Button>
              <Button to={primaryTo} variant="ghost-light" size="lg">
                {primaryLabel} <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
