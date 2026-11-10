import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaSection } from "@/components/sections/CtaSection";
import { PageHero } from "@/components/sections/PageHero";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { images } from "@/data/images";
import { process, services } from "@/data/services";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

export function ServicesPage() {
  useSeo({
    title: "Our Services | Accounting, Auditing, Business Registration, Consulting & IT | TV Clarity Capital",
    description:
      "Explore the professional services of TV Clarity Capital (Pvt) Ltd in Monaragala: accounting, auditing & financial services, business registration, business consulting and IT solutions.",
    path: "/services",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "TV Clarity Capital Services",
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: service.name,
          url: typeof window !== "undefined" ? `${window.location.origin}${service.path}` : service.path,
        })),
      },
    ],
  });

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Professional Services Designed Around Your Business"
        text="Five connected service lines covering finance, business setup, consulting and technology — so you can get clear, coordinated support from a single professional partner."
        crumbs={[{ label: "Services" }]}
        image={images.heroAbstract}
        actions={
          <>
            <Button to="/consultation">Get a Consultation</Button>
            <Button
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="navy"
              className="bg-[#1f9d55] text-white hover:bg-[#178a49]"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp {site.whatsappDisplay}
            </Button>
            <Button href={site.phoneHref} variant="ghost-light">
              Call {site.phoneDisplay}
            </Button>
          </>
        }
        visual={
          <div className="grid gap-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.slug}
                  to={service.path}
                  className="glass group flex items-center gap-4 rounded-2xl py-2.5 pl-2.5 pr-5 transition-colors hover:bg-white/10"
                  style={{ marginLeft: `${index * 14}px` }}
                >
                  <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/20">
                    <img
                      src={service.image.src}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" aria-hidden="true" />
                    <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-gold text-navy">
                      <Icon className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-white">{service.name}</span>
                  <ArrowRight className="h-4 w-4 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
                </Link>
              );
            })}
          </div>
        }
      />

      <section className="section-y relative overflow-hidden" aria-labelledby="all-services-heading">
        <div className="bg-dots-light mask-fade-b absolute inset-x-0 top-0 h-80 opacity-70" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading
            eyebrow="What We Offer"
            title={<span id="all-services-heading">Explore Our Service Lines</span>}
            subtitle="Each service can stand alone or work together with the others, depending on what your business needs."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {services.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} variant="detailed" />
            ))}
            <Reveal delay={services.length * 80} className="h-full">
              <div className="gradient-navy on-dark relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-7 text-white shadow-card sm:p-8">
                <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative">
                  <span className="eyebrow text-cyan">Not sure where to start?</span>
                  <h3 className="mt-4 text-2xl font-bold text-white">Tell us about your requirement</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                    Many requirements touch more than one area — a new business may need registration guidance,
                    accounting setup and a website. We will help you see the full picture and prioritize.
                  </p>
                </div>
                <div className="relative mt-8 flex flex-wrap gap-3">
                  <Button to="/consultation">Request a Consultation</Button>
                  <Button to="/faq" variant="ghost-light">
                    Read the FAQ
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="section-y relative overflow-hidden bg-light" aria-labelledby="services-process-heading">
        <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading
            eyebrow="How It Works"
            title={<span id="services-process-heading">One Consistent Process Across Every Service</span>}
            subtitle="Whatever you need, the way we work stays clear and predictable."
          />
          <div className="mt-14">
            <ProcessTimeline steps={process} />
          </div>
        </Container>
      </section>

      <CtaSection className="pb-16 sm:pb-20 lg:pb-28" />
    </>
  );
}
