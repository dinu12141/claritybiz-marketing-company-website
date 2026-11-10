import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeroEmblem } from "@/components/decor/HeroEmblem";
import { ChartLines, Particles, Rings } from "@/components/decor/Backgrounds";
import { CtaSection } from "@/components/sections/CtaSection";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { getContent, isSectionEnabled, lines, records, text } from "@/content/cms";
import { blogPosts } from "@/data/blog";
import { imageForCategory, images } from "@/data/images";
import { process, services, whyChooseUs } from "@/data/services";
import { site } from "@/data/site";
import { buildLocalBusinessSchema, useSeo } from "@/hooks/useSeo";

const defaultAboutParagraphs = [
  "TV Clarity Capital (Pvt) Ltd is a Monaragala-based professional services business providing accounting, auditing, business registration, consulting and IT-related solutions.",
  "Whether you are starting a new business, improving your financial processes or looking for practical technology solutions, our goal is to provide clear and professional support tailored to your requirements.",
];

const defaultAboutPoints = [
  "Finance, business and technology expertise in one place",
  "Clear, practical guidance without unnecessary jargon",
  "Support tailored to the size and stage of your business",
];

export function HomePage() {
  useSeo({
    title: "TV Clarity Capital (Pvt) Ltd | Accounting, Auditing, Business Registration & IT Solutions in Monaragala",
    description:
      "TV Clarity Capital (Pvt) Ltd provides accounting, auditing, business registration, business consulting and IT solutions in Monaragala, Sri Lanka. Professional solutions for finance, business and technology.",
    path: "/",
    ogTitle: "TV Clarity Capital (Pvt) Ltd | Professional Solutions for Finance, Business & Technology",
    ogDescription:
      "Accounting, auditing, business registration, consulting and IT solutions in Monaragala, Sri Lanka. Our Capital is Your Success.",
    jsonLd: [
      buildLocalBusinessSchema(),
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        url: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    ],
  });

  const hero = getContent("home", "hero");
  const servicesSection = getContent("home", "services");
  const about = getContent("home", "about");
  const why = getContent("home", "why");
  const processSection = getContent("home", "process");
  const insights = getContent("home", "insights");
  const cta = getContent("home", "cta");

  const whyCards = records(why, "cards");
  const processSteps = records(processSection, "steps");
  const timelineSteps = processSteps.length
    ? processSteps.map((step, index) => ({
        number: step.number || String(index + 1).padStart(2, "0"),
        title: step.title ?? "",
        description: step.description ?? "",
        icon: process[index]?.icon,
      }))
    : process;
  const whyItems = whyCards.length
    ? whyCards.map((card, index) => ({
        number: card.number || String(index + 1).padStart(2, "0"),
        title: card.title ?? "",
        description: card.description ?? "",
        icon: whyChooseUs[index]?.icon ?? whyChooseUs[0].icon,
      }))
    : whyChooseUs;

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      {isSectionEnabled("home", "hero") && (
        <section className="gradient-hero on-dark relative overflow-hidden text-white" aria-labelledby="hero-heading">
          <img
            src={images.heroAbstract.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-right opacity-80"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/80 to-navy/20" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-transparent to-navy-deep/20" aria-hidden="true" />
          <div className="bg-grid-dark absolute inset-0 opacity-30" aria-hidden="true" />
          <ChartLines className="bottom-0 left-0 h-[75%] w-full opacity-50" animate />
          <Particles count={18} />
          <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-royal/25 blur-3xl" aria-hidden="true" />

          <Container className="relative pb-16 pt-5 sm:pb-20 sm:pt-6 lg:pb-20 lg:pt-7">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
              <div className="max-w-2xl lg:-mt-4">
                <Reveal>
                  <span className="eyebrow text-xs text-cyan sm:text-sm">
                    <span className="h-px w-6 bg-gold sm:w-8" aria-hidden="true" />
                    {text(hero, "eyebrow", site.name)}
                  </span>
                </Reveal>
                <Reveal delay={80}>
                  <h1
                    id="hero-heading"
                    className="mt-6 text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:mt-8 sm:text-4xl lg:mt-10 lg:text-5xl xl:text-[3.5rem]"
                  >
                    {text(hero, "heading_line_1", "Clarity in Finance.")}
                    <br />
                    <span className="text-gradient-gold">{text(hero, "heading_line_2", "Confidence in Business.")}</span>
                  </h1>
                </Reveal>
                <Reveal delay={160}>
                  <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                    {text(
                      hero,
                      "description",
                      "Professional Accounting, Auditing, Business Registration, Consulting & IT Solutions for Individuals and Businesses.",
                    )}
                  </p>
                </Reveal>
                <Reveal delay={240} className="mt-6 flex flex-wrap items-center gap-3">
                  <Button to={text(hero, "primary_cta_link", "/consultation")} size="md">
                    {text(hero, "primary_cta_label", "Get a Consultation")} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button to={text(hero, "secondary_cta_link", "/services")} variant="ghost-light" size="md">
                    {text(hero, "secondary_cta_label", "Explore Our Services")}
                  </Button>
                </Reveal>
              </div>

              <Reveal delay={200} className="relative">
                <HeroEmblem />
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------ Value strip */}
      {isSectionEnabled("home", "value_strip") && (
        <section aria-label="Our service areas" className="relative z-10 -mt-8 sm:-mt-10">
          <Container>
            <Reveal className="card grid grid-cols-2 divide-y divide-line overflow-hidden rounded-2xl sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
              {services.slice(0, 5).map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.slug}
                    to={service.path}
                    className="group flex items-center gap-3 px-5 py-5 transition-colors hover:bg-light sm:px-6"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/[0.06] text-royal transition-colors group-hover:bg-navy group-hover:text-gold">
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <span className="text-sm font-semibold text-ink sm:text-[15px]">{service.shortName}</span>
                  </Link>
                );
              })}
            </Reveal>
          </Container>
        </section>
      )}

      {/* --------------------------------------------------------- Services */}
      {isSectionEnabled("home", "services") && (
        <section className="section-y relative overflow-hidden" aria-labelledby="services-heading">
          <div className="bg-dots-light mask-fade-b absolute inset-x-0 top-0 h-80 opacity-70" aria-hidden="true" />
          <Container className="relative">
            <SectionHeading
              eyebrow={text(servicesSection, "eyebrow", "What We Do")}
              title={<span id="services-heading">{text(servicesSection, "heading", "Our Professional Services")}</span>}
              subtitle={text(
                servicesSection,
                "subtitle",
                "Practical solutions designed to simplify your financial, business and technology needs.",
              )}
            />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-6 lg:[&>*]:col-span-2 lg:[&>*:nth-child(4)]:col-start-2">
              {services.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------------ About */}
      {isSectionEnabled("home", "about") && (
        <section className="section-y relative overflow-hidden bg-light" aria-labelledby="about-heading">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal className="relative order-2 lg:order-1">
                <div className="relative mx-auto max-w-lg pb-8 pr-4 sm:pr-8">
                  <Rings className="-left-16 -top-16 h-72 w-72" />
                  <div
                    className="absolute bottom-0 right-0 h-[70%] w-[70%] rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent"
                    aria-hidden="true"
                  />
                  <figure className="relative overflow-hidden rounded-3xl shadow-[0_30px_70px_-25px_rgba(6,43,82,0.45)]">
                    <img
                      src={images.officeDesk.src}
                      alt={images.officeDesk.alt}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" aria-hidden="true" />
                    <figcaption className="glass absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-2xl p-4">
                      <LogoImage size={56} className="shrink-0 ring-2 ring-gold/70" />
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold italic text-white sm:text-base">“{site.tagline}”</p>
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{site.shortName}</p>
                      </div>
                    </figcaption>
                  </figure>
                  <div className="absolute -right-1 top-6 rounded-2xl bg-navy px-4 py-3 text-white shadow-card-hover ring-1 ring-white/10 sm:right-0">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">{text(about, "badge_label", "Based in")}</p>
                    <p className="text-sm font-bold">{text(about, "badge_value", site.location)}</p>
                  </div>
                </div>
              </Reveal>

              <div className="order-1 lg:order-2">
                <SectionHeading
                  align="left"
                  eyebrow={text(about, "eyebrow", "About TV Clarity Capital")}
                  title={<span id="about-heading">{text(about, "heading", "Built Around Clarity, Trust & Progress")}</span>}
                />
                <Reveal delay={100} className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
                  {lines(about, "paragraphs", defaultAboutParagraphs).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </Reveal>
                <Reveal delay={180}>
                  <ul className="mt-7 space-y-3">
                    {lines(about, "points", defaultAboutPoints).map((point) => (
                      <li key={point} className="flex items-start gap-3 text-[15px] text-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-navy">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={260} className="mt-9 flex flex-wrap gap-3">
                  <Button to={text(about, "cta_link", "/about")} variant="navy">
                    {text(about, "cta_label", "Learn About Us")} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button to={text(about, "secondary_link", "/why-choose-us")} variant="outline">
                    {text(about, "secondary_label", "Why Choose Us")}
                  </Button>
                </Reveal>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---------------------------------------------------- Why choose us */}
      {isSectionEnabled("home", "why") && (
        <section className="section-y relative overflow-hidden" aria-labelledby="why-heading">
          <Container>
            <SectionHeading
              eyebrow={text(why, "eyebrow", "Why Choose Us")}
              title={<span id="why-heading">{text(why, "heading", "Why Choose TV Clarity Capital?")}</span>}
              subtitle={text(why, "subtitle", "A professional, practical approach that puts your business requirements first.")}
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={`${item.number}-${item.title}`} delay={index * 70}>
                    <article className="card card-hover group relative h-full overflow-hidden p-7">
                      <span
                        className="absolute -right-6 -top-6 font-display text-[6rem] font-extrabold leading-none text-navy/[0.04] transition-colors duration-300 group-hover:text-gold/15"
                        aria-hidden="true"
                      >
                        {item.number}
                      </span>
                      <div className="relative flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-light text-royal ring-1 ring-line transition-colors duration-300 group-hover:bg-navy group-hover:text-gold">
                          <Icon className="h-6 w-6" strokeWidth={1.8} />
                        </span>
                        <span className="font-display text-sm font-bold tracking-widest text-gold-dark">{item.number}</span>
                      </div>
                      <h3 className="relative mt-5 text-lg font-bold text-ink">{item.title}</h3>
                      <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{item.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ---------------------------------------------------------- Process */}
      {isSectionEnabled("home", "process") && (
        <section className="section-y relative overflow-hidden bg-light" aria-labelledby="process-heading">
          <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
          <Container className="relative">
            <SectionHeading
              eyebrow={text(processSection, "eyebrow", "How We Work")}
              title={<span id="process-heading">{text(processSection, "heading", "A Clear, Structured Process")}</span>}
              subtitle={text(
                processSection,
                "subtitle",
                "From the first conversation to ongoing support, every engagement follows a simple, transparent path.",
              )}
            />
            <div className="mt-14">
              <ProcessTimeline steps={timelineSteps} />
            </div>
          </Container>
        </section>
      )}

      {/* --------------------------------------------------------- Insights */}
      {isSectionEnabled("home", "insights") && blogPosts.length > 0 && (
        <section className="section-y" aria-labelledby="insights-heading">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                align="left"
                eyebrow={text(insights, "eyebrow", "Insights")}
                title={<span id="insights-heading">{text(insights, "heading", "Practical Business Insights")}</span>}
                subtitle={text(insights, "subtitle", "Short, useful reads on accounting, business setup and technology.")}
              />
              <Reveal>
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-royal hover:text-navy">
                  View all insights <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {blogPosts.slice(0, 3).map((post, index) => {
                const image = post.image ?? imageForCategory(post.category);
                return (
                  <Reveal key={post.slug} delay={index * 80}>
                    <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={image.src}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" aria-hidden="true" />
                        <span className="absolute bottom-4 left-5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-7">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{post.readTime}</span>
                        <h3 className="mt-3 text-lg font-bold leading-snug text-ink">
                          <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>
                        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-royal group-hover:text-navy">
                          Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* -------------------------------------------------------------- CTA */}
      {isSectionEnabled("home", "cta") && (
        <CtaSection
          className="pb-16 sm:pb-20 lg:pb-28"
          title={text(cta, "heading", "Let's Build a Stronger Business Together")}
          text={text(cta, "text", "Have a business, financial or technology requirement? Talk to TV Clarity Capital today.")}
          primaryLabel={text(cta, "button_label", "Request a Consultation")}
          primaryTo={text(cta, "button_link", "/consultation")}
        />
      )}
    </>
  );
}
