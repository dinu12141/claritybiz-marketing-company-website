import { ArrowUpRight, ClipboardList, Clock, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { ContactForm } from "@/components/sections/ContactForm";
import { PageHero } from "@/components/sections/PageHero";
import { serviceOptions } from "@/lib/inquiry";
import { images } from "@/data/images";
import { site } from "@/data/site";
import { buildLocalBusinessSchema, useSeo } from "@/hooks/useSeo";

const mapsSearchUrl = "https://www.google.com/maps/search/?api=1&query=Monaragala%2C+Sri+Lanka";
const mapsEmbedUrl = "https://www.google.com/maps?q=Monaragala,+Sri+Lanka&z=12&output=embed";

export function ContactPage() {
  const [params] = useSearchParams();
  const requested = params.get("service") ?? "";
  const defaultService = serviceOptions.includes(requested) ? requested : "";

  useSeo({
    title: "Contact TV Clarity Capital (Pvt) Ltd | Monaragala, Sri Lanka | 071 405 3449",
    description:
      "Contact TV Clarity Capital in Monaragala, Sri Lanka for accounting, auditing, business registration, consulting and IT solutions. Call 071 405 3449, message on WhatsApp or send an inquiry.",
    path: "/contact",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact TV Clarity Capital",
        mainEntity: buildLocalBusinessSchema(),
      },
    ],
  });

  const cards = [
    {
      title: "Call Us",
      value: site.phoneDisplay,
      description: "Speak to us directly about your requirement.",
      href: site.phoneHref,
      icon: Phone,
      cta: "Call now",
    },
    {
      title: "Visit Us",
      value: site.location,
      description: "Contact us to arrange a meeting in Monaragala.",
      href: mapsSearchUrl,
      icon: MapPin,
      cta: "View on map",
      external: true,
    },
    {
      title: "Connect With Us",
      value: "Facebook",
      description: "Follow our page for updates and announcements.",
      href: site.facebookUrl,
      icon: FacebookIcon,
      cta: "Open Facebook",
      external: true,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Let's Talk About Your Business"
        text="Whether you need accounting support, help registering a business, practical consulting or an IT solution, we are ready to listen and help you take the next step."
        crumbs={[{ label: "Contact" }]}
        image={images.contact}
        visual={
          <div className="relative mx-auto max-w-sm">
            <div className="glass rounded-3xl p-7">
              <div className="flex items-center gap-4">
                <LogoImage size={68} priority className="ring-2 ring-gold/70" />
                <div>
                  <p className="font-display text-lg font-bold text-white">{site.name}</p>
                  <p className="text-sm text-white/60">{site.location}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <a href={site.phoneHref} className="flex items-center justify-between rounded-xl bg-gold px-4 py-3 font-semibold text-navy transition-colors hover:bg-gold-dark">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {site.phoneDisplay}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <WhatsAppIcon className="h-4.5 w-4.5 text-[#25D366]" /> WhatsApp
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        }
      />

      {/* Contact cards */}
      <section className="relative z-10 -mt-10" aria-label="Contact options">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.title} delay={index * 80}>
                  <a
                    href={card.href}
                    {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="card card-hover group flex h-full flex-col p-6"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                      <Icon className="h-5.5 w-5.5" />
                    </span>
                    <span className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-muted">{card.title}</span>
                    <span className="mt-1 font-display text-xl font-bold text-navy">{card.value}</span>
                    <span className="mt-2 text-sm leading-relaxed text-muted">{card.description}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-royal group-hover:text-navy">
                      {card.cta} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Form + details */}
      <section className="section-y" aria-labelledby="form-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Consultation Request"
                title={<span id="form-heading">Send Us an Inquiry</span>}
                subtitle="Fill in the form and we will get back to you. Fields marked with * are required."
              />
              <Reveal delay={100} className="mt-8">
                <ContactForm defaultService={defaultService} />
              </Reveal>
            </div>

            <Reveal delay={150} className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-ink">Contact Information</h3>
                <ul className="mt-5 space-y-5">
                  <li className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{site.name}</p>
                      <p className="whitespace-pre-line text-sm text-muted">{site.address || site.location}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Phone / WhatsApp</p>
                      <a href={site.phoneHref} className="text-sm text-royal hover:text-navy">
                        {site.phoneDisplay}
                      </a>
                    </div>
                  </li>
                  {site.email && (
                    <li className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line">
                        <Mail className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">Email</p>
                        <a href={`mailto:${site.email}`} className="break-all text-sm text-royal hover:text-navy">
                          {site.email}
                        </a>
                      </div>
                    </li>
                  )}
                  <li className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line">
                      <FacebookIcon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Facebook</p>
                      <a
                        href={site.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm text-royal hover:text-navy"
                      >
                        {site.facebookUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    </div>
                  </li>
                  {site.socials.map((social) => (
                    <li key={social.key} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line">
                        <Globe className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{social.label}</p>
                        <a href={social.url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-royal hover:text-navy">
                          {social.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    </li>
                  ))}
                  <li className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line">
                      <Clock className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{site.businessHours ? "Business hours" : "Response"}</p>
                      <p className="text-sm text-muted">
                        {site.businessHours || "We aim to respond to every inquiry as soon as possible during business hours."}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <Link
                to="/consultation"
                className="card card-hover group flex items-center gap-4 p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-navy">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">Prefer a guided request?</span>
                  <span className="block text-xs text-muted">Use our step-by-step consultation form and receive a reference number.</span>
                </span>
                <ArrowUpRight className="h-4.5 w-4.5 shrink-0 text-royal transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <div className="gradient-navy on-dark relative overflow-hidden rounded-2xl p-6 text-white">
                <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative flex items-center gap-4">
                  <LogoImage size={56} className="ring-2 ring-gold/60" />
                  <div>
                    <p className="text-sm font-semibold italic text-gold">{site.tagline}</p>
                    <p className="mt-1 text-xs text-white/60">Finance · Business · Technology</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Location */}
      <section className="section-y relative overflow-hidden bg-light" aria-labelledby="location-heading">
        <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Our Location"
                title={<span id="location-heading">Monaragala, Sri Lanka</span>}
                subtitle="TV Clarity Capital (Pvt) Ltd is based in Monaragala and supports clients across the district and beyond. Please contact us to arrange a meeting."
              />
              <Reveal delay={100} className="mt-8 flex flex-wrap gap-3">
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-deep-blue"
                >
                  <MapPin className="h-4 w-4" /> Open in Google Maps
                </a>
                <a
                  href={site.phoneHref}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-navy/20 bg-white px-6 text-sm font-semibold text-navy transition-colors hover:border-navy"
                >
                  <Phone className="h-4 w-4" /> {site.phoneDisplay}
                </a>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div className="card overflow-hidden">
                <figure className="relative h-48 overflow-hidden sm:h-56">
                  <img
                    src={images.landscape.src}
                    alt={images.landscape.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" aria-hidden="true" />
                  <figcaption className="absolute inset-x-5 bottom-4 flex items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-navy">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-display text-base font-bold">{site.location}</p>
                        <p className="text-xs text-white/70">Monaragala District, Uva Province</p>
                      </div>
                    </div>
                    <LogoImage size={44} className="hidden ring-2 ring-white/80 sm:block" />
                  </figcaption>
                </figure>
                <iframe
                  title="Map showing the general area of Monaragala, Sri Lanka"
                  src={mapsEmbedUrl}
                  className="h-[280px] w-full border-0 sm:h-[320px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <p className="border-t border-line bg-white px-5 py-3 text-xs text-muted">
                  Map shows the general Monaragala area. Please contact us for meeting arrangements.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
