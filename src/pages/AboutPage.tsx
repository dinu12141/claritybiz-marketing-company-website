import { ArrowRight, Eye, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Rings } from "@/components/decor/Backgrounds";
import { CtaSection } from "@/components/sections/CtaSection";
import { ImageBand } from "@/components/sections/ImageBand";
import { PageHero } from "@/components/sections/PageHero";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { images } from "@/data/images";
import { businessAreas, coreValues, process } from "@/data/services";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

export function AboutPage() {
  useSeo({
    title: "About TV Clarity Capital (Pvt) Ltd | Professional Services in Monaragala, Sri Lanka",
    description:
      "Learn about TV Clarity Capital (Pvt) Ltd, a Monaragala-based professional services company providing accounting, auditing, business registration, consulting and IT solutions with clarity and integrity.",
    path: "/about",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About TV Clarity Capital",
        url: typeof window !== "undefined" ? `${window.location.origin}/about` : undefined,
        about: { "@type": "Organization", name: site.name },
      },
    ],
  });

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="About TV Clarity Capital"
        text="A Monaragala-based professional services company bringing accounting, auditing, business registration, consulting and IT solutions together under one clear, trustworthy approach."
        crumbs={[{ label: "About" }]}
        image={images.consulting}
        actions={
          <>
            <Button to="/services">Explore Our Services</Button>
            <Button to="/contact" variant="ghost-light">
              Get in Touch
            </Button>
          </>
        }
        visual={
          <div className="relative mx-auto max-w-sm">
            <div className="glass rounded-full p-6">
              <LogoImage size={360} priority fluid className="h-auto w-full ring-4 ring-white/80" />
            </div>
          </div>
        }
      />

      {/* Company overview */}
      <section className="section-y relative overflow-hidden" aria-labelledby="overview-heading">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Company Overview"
                title={<span id="overview-heading">Professional Solutions for Finance, Business &amp; Technology</span>}
              />
              <Reveal delay={100} className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
                <p>{site.description}</p>
                <p>
                  Based in Monaragala, Sri Lanka, we work with entrepreneurs, small and growing businesses and
                  organizations that need dependable support across finance, business setup, operations and
                  technology. Our approach combines careful professional work with straightforward communication.
                </p>
                <p>
                  The emblem that represents us carries our promise: <em>“{site.tagline}”</em>. Every service we
                  offer is designed to bring clarity to your decisions and confidence to the way your business
                  operates.
                </p>
              </Reveal>
            </div>
            <Reveal delay={120} className="relative">
              <figure className="relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-25px_rgba(6,43,82,0.45)]">
                <img
                  src={images.clarity.src}
                  alt={images.clarity.alt}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" aria-hidden="true" />
                <figcaption className="absolute inset-x-5 bottom-5 flex items-center gap-4">
                  <LogoImage size={60} className="shrink-0 ring-2 ring-gold/70" />
                  <div>
                    <p className="font-display text-base font-bold text-white sm:text-lg">Clarity in every engagement</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Finance · Business · Technology</p>
                  </div>
                </figcaption>
              </figure>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="card p-5">
                  <span className="eyebrow text-royal">Location</span>
                  <p className="mt-2 font-display text-lg font-extrabold text-navy">Monaragala, Sri Lanka</p>
                  <p className="mt-1.5 text-sm text-muted">Supporting clients locally and across Sri Lanka.</p>
                </div>
                <div className="gradient-navy on-dark card border-transparent p-5 text-white">
                  <span className="eyebrow text-cyan">Business Type</span>
                  <p className="mt-2 font-display text-lg font-bold">Private Limited Company</p>
                  <p className="mt-1.5 text-sm text-white/70">Professional services provider.</p>
                </div>
                <div className="card p-5">
                  <span className="eyebrow text-royal">Focus Areas</span>
                  <p className="mt-2 font-display text-lg font-bold text-navy">Finance · Business · IT</p>
                  <p className="mt-1.5 text-sm text-muted">Five connected service lines, one point of contact.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="section-y relative overflow-hidden bg-light" aria-labelledby="mission-heading">
        <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Purpose"
            title={<span id="mission-heading">Our Mission &amp; Vision</span>}
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="gradient-navy on-dark relative h-full overflow-hidden rounded-3xl p-8 text-white shadow-card sm:p-10">
                <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden="true" />
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-navy">
                    <Target className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-6 text-2xl font-bold text-white">Our Mission</h3>
                  <p className="mt-4 text-lg leading-relaxed text-white/80">
                    To provide clear, practical and professional financial, business and technology solutions that
                    help clients operate with greater confidence and efficiency.
                  </p>
                </div>
              </article>
            </Reveal>
            <Reveal delay={120}>
              <article className="card relative h-full overflow-hidden p-8 sm:p-10">
                <Rings className="-right-24 -top-24 h-80 w-80" />
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-gold">
                    <Eye className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-6 text-2xl font-bold text-ink">Our Vision</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">
                    To become a trusted professional services partner for businesses and individuals seeking
                    clarity, growth and digital progress.
                  </p>
                </div>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Local roots */}
      <ImageBand image={images.landscape} overlay="soft" ariaLabelledBy="roots-heading">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <span className="eyebrow text-cyan">
              <span className="h-px w-6 bg-gold" aria-hidden="true" />
              Our Home
            </span>
            <h2 id="roots-heading" className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              Rooted in Monaragala. Focused on Your Progress.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              TV Clarity Capital (Pvt) Ltd is based in Monaragala, Sri Lanka, and supports individuals and
              businesses in the district and beyond. We combine a local, personal way of working with
              professional standards and modern technology.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/contact">Contact Us</Button>
              <Button href={site.phoneHref} variant="ghost-light">
                Call {site.phoneDisplay}
              </Button>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:justify-self-end">
            <div className="glass flex items-center gap-5 rounded-3xl p-6">
              <LogoImage size={84} className="shrink-0 ring-2 ring-gold/70" />
              <div>
                <p className="font-display text-xl font-bold italic text-white">“{site.tagline}”</p>
                <p className="mt-1 text-sm text-white/70">{site.name}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{site.location}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </ImageBand>

      {/* Core values */}
      <section className="section-y" aria-labelledby="values-heading">
        <Container>
          <SectionHeading
            eyebrow="Core Values"
            title={<span id="values-heading">The Principles Behind Our Work</span>}
            subtitle="These values guide how we work with every client, on every engagement."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={index * 70}>
                  <article className="card card-hover group flex h-full gap-5 p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line transition-colors group-hover:bg-navy group-hover:text-gold">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-ink">{value.title}</h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{value.description}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Professional approach */}
      <section className="section-y relative overflow-hidden bg-light" aria-labelledby="approach-heading">
        <Container>
          <SectionHeading
            eyebrow="Professional Approach"
            title={<span id="approach-heading">How We Approach Every Engagement</span>}
            subtitle="A consistent, transparent way of working that keeps you informed and in control."
          />
          <div className="mt-14">
            <ProcessTimeline steps={process} />
          </div>
        </Container>
      </section>

      {/* Business areas */}
      <section className="section-y" aria-labelledby="areas-heading">
        <Container>
          <SectionHeading
            eyebrow="Business Areas"
            title={<span id="areas-heading">Where We Can Help</span>}
            subtitle="Connected service lines that support your business from registration to daily operations and digital growth."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businessAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <Reveal key={area.title} delay={index * 60}>
                  <Link
                    to={area.to}
                    className="card card-hover group flex items-center gap-4 p-5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <span className="flex-1 text-base font-semibold text-ink">{area.title}</span>
                    <ArrowRight className="h-5 w-5 text-royal transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <CtaSection
        className="pb-16 sm:pb-20 lg:pb-28"
        title="Work With a Team That Values Clarity"
        text="Let's discuss how TV Clarity Capital can support your business, financial or technology requirements."
      />
    </>
  );
}
