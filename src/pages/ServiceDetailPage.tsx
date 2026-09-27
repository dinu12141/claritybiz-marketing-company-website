import { ArrowRight, Check, Info, Phone } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { LogoImage } from "@/components/ui/Logo";
import { CtaSection } from "@/components/sections/CtaSection";
import { PageHero } from "@/components/sections/PageHero";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { ServiceHeroVisual } from "@/components/sections/ServiceHeroVisual";
import { getServiceBySlug, services } from "@/data/services";
import { site, whatsappWithMessage } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/utils/cn";

export function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return <ServiceDetail key={service.slug} service={service} />;
}

function ServiceDetail({ service }: { service: NonNullable<ReturnType<typeof getServiceBySlug>> }) {
  const contactPath = `/consultation?service=${encodeURIComponent(service.slug)}`;
  const whatsappLink = whatsappWithMessage(
    `Hello ${site.shortName}, I would like to discuss ${service.name}.`,
  );
  const related = services.filter((item) => item.slug !== service.slug);
  const isWide = service.sections.length > 6;

  useSeo({
    title: service.seo.title,
    description: service.seo.description,
    path: service.path,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.name,
        description: service.description,
        serviceType: service.name,
        areaServed: { "@type": "Country", name: "Sri Lanka" },
        provider: {
          "@type": "ProfessionalService",
          name: site.name,
          telephone: site.phoneE164,
          address: { "@type": "PostalAddress", addressLocality: "Monaragala", addressCountry: "LK" },
        },
        url: typeof window !== "undefined" ? `${window.location.origin}${service.path}` : service.path,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: typeof window !== "undefined" ? window.location.origin : "/" },
          { "@type": "ListItem", position: 2, name: "Services", item: typeof window !== "undefined" ? `${window.location.origin}/services` : "/services" },
          { "@type": "ListItem", position: 3, name: service.name },
        ],
      },
    ],
  });

  return (
    <>
      <PageHero
        eyebrow={service.eyebrow}
        title={service.heroTitle}
        text={service.heroText}
        crumbs={[{ label: "Services", to: "/services" }, { label: service.name }]}
        image={service.image}
        backdrop="blurred"
        visualMobile
        actions={
          <>
            <Button to={contactPath}>
              {service.cta.button} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={site.phoneHref} variant="ghost-light">
              <Phone className="h-4 w-4" /> {site.phoneDisplay}
            </Button>
          </>
        }
        visual={<ServiceHeroVisual service={service} />}
      />

      {/* Intro + at-a-glance */}
      <section className="section-y" aria-labelledby="intro-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Overview"
                title={<span id="intro-heading">Professional {service.shortName} Support, Explained Clearly</span>}
              />
              <Reveal delay={100} className="mt-6 space-y-5 text-base leading-relaxed text-muted sm:text-lg">
                {service.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Reveal>
              {service.disclaimer && (
                <Reveal delay={160} className="mt-8">
                  <div className="flex gap-3 rounded-2xl border border-gold/40 bg-gold/[0.08] px-5 py-4 text-sm leading-relaxed text-ink/80">
                    <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" />
                    <p>{service.disclaimer}</p>
                  </div>
                </Reveal>
              )}

              <Reveal delay={200} className="mt-10">
                <figure className="relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-25px_rgba(6,43,82,0.45)]">
                  <img
                    src={service.secondary.image.src}
                    alt={service.secondary.image.alt}
                    className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />
                  <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-7 sm:bottom-6">
                    <div className="flex items-center gap-4">
                      <LogoImage size={52} className="hidden shrink-0 ring-2 ring-gold/70 sm:block" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{service.shortName}</p>
                        <p className="mt-1 max-w-md font-display text-base font-bold leading-snug sm:text-lg">
                          {service.secondary.caption}
                        </p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 text-xs font-medium text-white/60 md:block">{site.location}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </div>

            <Reveal delay={140} className="lg:sticky lg:top-28 lg:self-start">
              <div className="card overflow-hidden">
                <div className="gradient-navy on-dark p-6 text-white">
                  <p className="eyebrow text-cyan">At a glance</p>
                  <p className="mt-2 font-display text-xl font-bold">{service.name}</p>
                </div>
                <ul className="space-y-3 p-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] text-ink">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-navy">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t border-line bg-light/70 p-6">
                  <Button to={contactPath} className="w-full">
                    Request a Consultation
                  </Button>
                  <Button href={whatsappLink} variant="outline" className="w-full">
                    <WhatsAppIcon className="h-4 w-4 text-[#1f9d55]" /> Message on WhatsApp
                  </Button>
                  <p className="text-center text-xs text-muted">
                    Or call{" "}
                    <a href={site.phoneHref} className="font-semibold text-navy">
                      {site.phoneDisplay}
                    </a>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Sections */}
      <section className="section-y relative overflow-hidden bg-light" aria-labelledby="sections-heading">
        <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Service Details"
            title={<span id="sections-heading">{service.sectionsTitle}</span>}
            subtitle={service.sectionsSubtitle}
          />
          <div className={cn("mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3", isWide && "xl:grid-cols-4")}>
            {service.sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.title} delay={index * 60}>
                  <article className="card card-hover group h-full p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-ink">{section.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{section.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Consultation journey */}
      {service.journey && (
        <section className="section-y" aria-labelledby="journey-heading">
          <Container>
            <SectionHeading
              eyebrow="Consultation Journey"
              title={<span id="journey-heading">Discuss → Analyze → Recommend → Implement → Review</span>}
              subtitle="A structured journey that turns conversations into decisions and decisions into results."
            />
            <div className="mt-14">
              <ProcessTimeline
                steps={service.journey.map((step, index) => ({
                  number: String(index + 1).padStart(2, "0"),
                  title: step.step,
                  description: step.description,
                }))}
              />
            </div>
          </Container>
        </section>
      )}

      {/* Audience */}
      {service.audience && (
        <section className="section-y relative overflow-hidden" aria-labelledby="audience-heading">
          <Container>
            <div className="gradient-navy on-dark relative overflow-hidden rounded-3xl px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
              <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                <div>
                  <span className="eyebrow text-cyan">
                    <span className="h-px w-6 bg-gold" aria-hidden="true" />
                    Who we support
                  </span>
                  <h2 id="audience-heading" className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                    {service.audience.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{service.audience.subtitle}</p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {service.audience.items.map((item, index) => (
                    <Reveal as="li" key={item} delay={index * 60}>
                      <div className="glass flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-white">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-navy">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        {item}
                      </div>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Related services */}
      <section className="section-y bg-light" aria-labelledby="related-heading">
        <Container>
          <SectionHeading
            eyebrow="Related Services"
            title={<span id="related-heading">Other Ways We Can Support You</span>}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.slug} delay={index * 60}>
                  <Link to={item.path} className="card card-hover group flex h-full flex-col p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/[0.06] text-royal transition-colors group-hover:bg-navy group-hover:text-gold">
                      <Icon className="h-5.5 w-5.5" strokeWidth={1.9} />
                    </span>
                    <span className="mt-4 text-base font-bold text-ink">{item.name}</span>
                    <span className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-royal group-hover:text-navy">
                      Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <CtaSection
        className="pb-16 sm:pb-20 lg:pb-28"
        title={service.cta.title}
        text={service.cta.text}
        primaryLabel={service.cta.button}
        primaryTo={contactPath}
      />
    </>
  );
}
