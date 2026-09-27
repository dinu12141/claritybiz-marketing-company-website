import {
  ArrowRight,
  Briefcase,
  Check,
  Cpu,
  Goal,
  Handshake,
  Lightbulb,
  Minus,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoImage } from "@/components/ui/Logo";
import { CtaSection } from "@/components/sections/CtaSection";
import { PageHero } from "@/components/sections/PageHero";
import { images } from "@/data/images";
import { whyChooseUs } from "@/data/services";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

const pillars = [
  {
    title: "Professionalism",
    icon: Briefcase,
    text: "We treat every engagement, large or small, with the same care. Clear scope, organized work and respectful communication are the baseline, not extras.",
    points: ["Structured engagements", "Careful, accurate work", "Respect for your time and information"],
  },
  {
    title: "Clarity",
    icon: Lightbulb,
    text: "Finance, compliance and technology can be confusing. We explain things in plain language and make sure you understand your options before decisions are made.",
    points: ["Plain-language explanations", "Transparent next steps", "No unnecessary jargon"],
  },
  {
    title: "Business Understanding",
    icon: Target,
    text: "We take time to understand how your business actually works, its stage, its resources and its goals, so that recommendations fit your reality.",
    points: ["Solutions sized to your business", "Practical, achievable recommendations", "Focus on what moves you forward"],
  },
  {
    title: "Technology Integration",
    icon: Cpu,
    text: "Because we work across finance and IT, we can connect the two: better records, simpler processes and digital tools that support the way you operate.",
    points: ["Finance and IT under one roof", "Process automation where it helps", "Modern, practical digital solutions"],
  },
  {
    title: "Personalized Support",
    icon: Handshake,
    text: "You are not handed a template. You work directly with people who know your situation and remain accessible as your requirements evolve.",
    points: ["Direct, accessible communication", "Support tailored to your requirement", "Continuity as your business grows"],
  },
  {
    title: "Long-Term Thinking",
    icon: Goal,
    text: "We prefer sustainable foundations over quick fixes, building relationships and systems that continue to serve your business well into the future.",
    points: ["Sustainable, durable solutions", "Ongoing relationship mindset", "Growth-oriented guidance"],
  },
];

const comparison = [
  { aspect: "Communication", traditional: "Technical terms, minimal explanation", clarity: "Plain language and clear next steps" },
  { aspect: "Scope", traditional: "One isolated task at a time", clarity: "Finance, business and IT viewed together" },
  { aspect: "Recommendations", traditional: "Generic, template-based", clarity: "Shaped around your business and stage" },
  { aspect: "Technology", traditional: "Treated as a separate concern", clarity: "Integrated where it adds real value" },
  { aspect: "Relationship", traditional: "Transactional", clarity: "Ongoing, long-term partnership" },
  { aspect: "Outcome", traditional: "Completed paperwork", clarity: "Clarity, confidence and better decisions" },
];

export function WhyChooseUsPage() {
  useSeo({
    title: "Why Choose TV Clarity Capital? | Clarity-Focused Professional Services in Monaragala",
    description:
      "Discover the TV Clarity Capital approach: professionalism, clarity, business understanding, technology integration, personalized support and long-term thinking for businesses in Monaragala and Sri Lanka.",
    path: "/why-choose-us",
  });

  return (
    <>
      <PageHero
        eyebrow="Why Choose Us"
        title="A Clarity-Focused Approach to Professional Services"
        text="What sets TV Clarity Capital apart is not a single service but the way we work: professionally, clearly and with your long-term business success in mind."
        crumbs={[{ label: "Why Choose Us" }]}
        image={images.clarity}
        actions={
          <>
            <Button to="/consultation">Get a Consultation</Button>
            <Button to="/services" variant="ghost-light">
              Our Services
            </Button>
          </>
        }
        visual={
          <div className="relative mx-auto max-w-sm">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <LogoImage size={72} priority className="ring-2 ring-gold/70" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Our promise</p>
                  <p className="font-display text-lg font-bold text-white">Our Capital is Your Success</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2.5">
                {whyChooseUs.map((item) => (
                  <li key={item.number} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90">
                    <span className="font-display text-xs font-bold text-gold">{item.number}</span>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      />

      {/* Pillars */}
      <section className="section-y" aria-labelledby="pillars-heading">
        <Container>
          <SectionHeading
            eyebrow="Our Approach"
            title={<span id="pillars-heading">Six Principles That Shape Every Engagement</span>}
            subtitle="Together these principles define what working with TV Clarity Capital feels like."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={index * 70}>
                  <article className="card card-hover group h-full p-7 sm:p-8">
                    <div className="flex items-center gap-4">
                      <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-navy text-gold">
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="font-display text-xs font-bold tracking-[0.2em] text-gold-dark">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="text-xl font-bold text-ink">{pillar.title}</h3>
                      </div>
                    </div>
                    <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">{pillar.text}</p>
                    <ul className="mt-5 space-y-2">
                      {pillar.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-ink/85">
                          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Comparison */}
      <section className="section-y relative overflow-hidden bg-light" aria-labelledby="comparison-heading">
        <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative">
          <SectionHeading
            eyebrow="The Difference"
            title={<span id="comparison-heading">Traditional Approach vs. Clarity-Focused Approach</span>}
            subtitle="A simple comparison of how we aim to work differently."
          />
          <Reveal className="mt-14 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="grid grid-cols-[1fr_1.2fr_1.2fr] border-b border-line bg-light/80 text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm">
              <div className="px-4 py-4 text-muted sm:px-6">Aspect</div>
              <div className="px-4 py-4 text-muted sm:px-6">Traditional Approach</div>
              <div className="bg-navy px-4 py-4 text-gold sm:px-6">Clarity-Focused Approach</div>
            </div>
            {comparison.map((row, index) => (
              <div
                key={row.aspect}
                className={`grid grid-cols-[1fr_1.2fr_1.2fr] text-sm sm:text-[15px] ${index < comparison.length - 1 ? "border-b border-line" : ""}`}
              >
                <div className="px-4 py-4 font-semibold text-ink sm:px-6 sm:py-5">{row.aspect}</div>
                <div className="flex items-start gap-2 px-4 py-4 text-muted sm:px-6 sm:py-5">
                  <Minus className="mt-1 h-3.5 w-3.5 shrink-0 text-muted/60" aria-hidden="true" />
                  <span>{row.traditional}</span>
                </div>
                <div className="flex items-start gap-2 bg-navy/[0.035] px-4 py-4 font-medium text-navy sm:px-6 sm:py-5">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-gold-dark" strokeWidth={3} aria-hidden="true" />
                  <span>{row.clarity}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Summary strip */}
      <section className="section-y" aria-labelledby="summary-heading">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative">
              <div
                className="absolute -left-4 -top-4 h-[60%] w-[60%] rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent"
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
                  <LogoImage size={52} className="shrink-0 ring-2 ring-gold/70" />
                  <div>
                    <p className="font-display text-sm font-bold italic text-white sm:text-base">“{site.tagline}”</p>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{site.location}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="In Short"
                title={<span id="summary-heading">Practical Expertise, Delivered With Clarity</span>}
                subtitle="If you value clear communication, professional work and a partner who understands both finance and technology, we would be glad to talk."
              />
              <Reveal delay={100} className="mt-8 flex flex-wrap gap-3">
                <Button to="/consultation" size="lg">
                  Request a Consultation <ArrowRight className="h-4.5 w-4.5" />
                </Button>
                <Button to="/faq" variant="outline" size="lg">
                  Read FAQ
                </Button>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <CtaSection className="pb-16 sm:pb-20 lg:pb-28" />
    </>
  );
}
