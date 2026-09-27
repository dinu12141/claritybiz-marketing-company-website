import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Accordion } from "@/components/sections/Accordion";
import { CtaSection } from "@/components/sections/CtaSection";
import { PageHero } from "@/components/sections/PageHero";
import { faqs } from "@/data/faq";
import { images } from "@/data/images";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

export function FaqPage() {
  useSeo({
    title: "Frequently Asked Questions | TV Clarity Capital (Pvt) Ltd, Monaragala",
    description:
      "Answers to common questions about TV Clarity Capital's accounting, auditing, business registration, consulting and IT services in Monaragala, Sri Lanka, and how to request a consultation.",
    path: "/faq",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  });

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        text="Clear answers to the questions we are asked most often about our services, location and how to get in touch."
        crumbs={[{ label: "FAQ" }]}
        image={images.consulting}
        compact
      />

      <section className="section-y" aria-labelledby="faq-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Common Questions"
                title={<span id="faq-heading">Everything You Need to Know</span>}
                subtitle="If your question is not covered here, contact us and we will be happy to help."
              />
              <Reveal delay={100} className="mt-10">
                <Accordion items={faqs} />
              </Reveal>
            </div>

            <Reveal delay={150} className="lg:sticky lg:top-28 lg:self-start">
              <div className="gradient-navy on-dark relative overflow-hidden rounded-3xl p-7 text-white shadow-card">
                <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative">
                  <span className="eyebrow text-cyan">Still have questions?</span>
                  <h3 className="mt-3 text-2xl font-bold text-white">Talk to us directly</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                    A short conversation is often the quickest way to understand how we can help with your
                    specific requirement.
                  </p>
                  <div className="mt-6 space-y-3">
                    <Button href={site.phoneHref} className="w-full">
                      <Phone className="h-4 w-4" /> Call {site.phoneDisplay}
                    </Button>
                    <Button href={site.whatsappHref} variant="ghost-light" className="w-full">
                      <WhatsAppIcon className="h-4.5 w-4.5" /> WhatsApp
                    </Button>
                    <Button to="/contact" variant="white" className="w-full">
                      Send an Inquiry <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-5 text-xs text-white/50">{site.location}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaSection className="pb-16 sm:pb-20 lg:pb-28" />
    </>
  );
}
