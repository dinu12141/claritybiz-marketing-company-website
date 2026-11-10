import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/sections/PageHero";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

type LegalKind = "privacy" | "terms";

type Section = { heading: string; paragraphs: string[] };

const content: Record<LegalKind, { title: string; intro: string; path: string; sections: Section[]; seoTitle: string; seoDescription: string }> = {
  privacy: {
    title: "Privacy Policy",
    path: "/privacy-policy",
    seoTitle: "Privacy Policy | TV Clarity Capital (Pvt) Ltd",
    seoDescription:
      "How TV Clarity Capital (Pvt) Ltd handles the personal information you share through this website and when contacting us.",
    intro:
      "This Privacy Policy explains how TV Clarity Capital (Pvt) Ltd handles the information you share with us through this website and when you contact us.",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "When you contact us through the inquiry form, by phone, WhatsApp or social media, we may receive your name, phone number, email address, the service you are interested in and the details of your message.",
          "This website may also use standard technical information, such as browser type and pages visited, to help us understand how the site is used and to keep it working properly.",
        ],
      },
      {
        heading: "How we use your information",
        paragraphs: [
          "We use the information you provide to respond to your inquiry, to arrange consultations and to provide the services you request. We do not sell your personal information.",
        ],
      },
      {
        heading: "Sharing and security",
        paragraphs: [
          "We share information only where necessary to deliver our services, where you have asked us to, or where required by applicable law. We take reasonable steps to protect the information we hold.",
        ],
      },
      {
        heading: "Third-party links",
        paragraphs: [
          "This website contains links to third-party services such as Facebook, WhatsApp and Google Maps. Those services operate under their own privacy policies, which we encourage you to review.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `If you have any questions about this policy or the information we hold about you, please contact TV Clarity Capital (Pvt) Ltd, Monaragala, Sri Lanka, on WhatsApp (${site.whatsappDisplay}), phone (${site.phoneDisplay}), or email (${site.email}).`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    path: "/terms",
    seoTitle: "Terms of Use | TV Clarity Capital (Pvt) Ltd",
    seoDescription: "Terms governing the use of the TV Clarity Capital (Pvt) Ltd website and the information it contains.",
    intro:
      "By using this website you agree to the following terms. Please read them carefully.",
    sections: [
      {
        heading: "Website content",
        paragraphs: [
          "The information on this website is provided for general information about TV Clarity Capital (Pvt) Ltd and its services. It is not professional, legal, financial or tax advice for any specific situation. Please contact us for advice tailored to your requirements.",
        ],
      },
      {
        heading: "Services and engagements",
        paragraphs: [
          "Specific services, their scope and any fees are agreed separately for each engagement. The descriptions on this website are indicative and subject to the applicable requirements, scope and qualifications relevant to the engagement.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "The TV Clarity Capital name, logo and website content are the property of TV Clarity Capital (Pvt) Ltd and may not be reproduced without permission.",
        ],
      },
      {
        heading: "External links",
        paragraphs: [
          "Links to third-party websites are provided for convenience. We are not responsible for the content or practices of those websites.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may update these terms from time to time. Continued use of the website after changes are published constitutes acceptance of the updated terms.",
        ],
      },
    ],
  },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const page = content[kind];

  useSeo({ title: page.seoTitle, description: page.seoDescription, path: page.path });

  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} text={page.intro} crumbs={[{ label: page.title }]} compact />
      <section className="section-y" aria-label={page.title}>
        <Container>
          <Reveal className="max-w-3xl space-y-10">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xl font-bold text-ink sm:text-2xl">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-base leading-relaxed text-muted">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-sm text-muted">Last updated: {site.copyrightYear}</p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
