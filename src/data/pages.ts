/**
 * Default CMS content for the public pages. These values act as the
 * fallback/seed; the admin portal stores overrides in `page_sections`.
 */
export type SectionValue = string | string[] | Record<string, string>[];
export type SectionContent = Record<string, SectionValue>;

export type SectionDef = {
  key: string;
  title: string;
  description?: string;
  enabled: boolean;
  content: SectionContent;
};

export type PageDef = {
  slug: string;
  title: string;
  path: string;
  sections: SectionDef[];
};

export const pageDefaults: Record<string, PageDef> = {
  home: {
    slug: "home",
    title: "Homepage",
    path: "/",
    sections: [
      {
        key: "hero",
        title: "Hero",
        description: "The main banner at the top of the homepage.",
        enabled: true,
        content: {
          eyebrow: "TV Clarity Capital (Pvt) Ltd",
          heading_line_1: "Clarity in Finance.",
          heading_line_2: "Confidence in Business.",
          description:
            "Professional Accounting, Auditing, Business Registration, Consulting & IT Solutions for Individuals and Businesses.",
          primary_cta_label: "Get a Consultation",
          primary_cta_link: "/consultation",
          secondary_cta_label: "Explore Our Services",
          secondary_cta_link: "/services",
        },
      },
      {
        key: "value_strip",
        title: "Service strip",
        description: "The row of service shortcuts directly below the hero.",
        enabled: true,
        content: {},
      },
      {
        key: "services",
        title: "Services section",
        enabled: true,
        content: {
          eyebrow: "What We Do",
          heading: "Our Professional Services",
          subtitle: "Practical solutions designed to simplify your financial, business and technology needs.",
        },
      },
      {
        key: "about",
        title: "About section",
        enabled: true,
        content: {
          eyebrow: "About TV Clarity Capital",
          heading: "Built Around Clarity, Trust & Progress",
          paragraphs: [
            "TV Clarity Capital (Pvt) Ltd is a Monaragala-based professional services business providing accounting, auditing, business registration, consulting and IT-related solutions.",
            "Whether you are starting a new business, improving your financial processes or looking for practical technology solutions, our goal is to provide clear and professional support tailored to your requirements.",
          ],
          points: [
            "Finance, business and technology expertise in one place",
            "Clear, practical guidance without unnecessary jargon",
            "Support tailored to the size and stage of your business",
          ],
          cta_label: "Learn About Us",
          cta_link: "/about",
          secondary_label: "Why Choose Us",
          secondary_link: "/why-choose-us",
          badge_label: "Based in",
          badge_value: "Monaragala, Sri Lanka",
        },
      },
      {
        key: "why",
        title: "Why Choose Us section",
        enabled: true,
        content: {
          eyebrow: "Why Choose Us",
          heading: "Why Choose TV Clarity Capital?",
          subtitle: "A professional, practical approach that puts your business requirements first.",
          cards: [
            { number: "01", title: "Professional Approach", description: "Every engagement is handled with care, structure and attention to detail, from the first conversation to the final deliverable." },
            { number: "02", title: "Clear & Practical Guidance", description: "We explain financial, business and technical matters in plain language, so you always understand your options and next steps." },
            { number: "03", title: "Business-Focused Solutions", description: "Our recommendations are shaped around your business, its size and its goals, not around a one-size-fits-all template." },
            { number: "04", title: "Finance & Technology Expertise", description: "Combining accounting, business and IT capabilities allows us to solve problems that sit between departments." },
            { number: "05", title: "Personalized Support", description: "You work directly with people who understand your situation and are accessible when you need them." },
            { number: "06", title: "Long-Term Business Mindset", description: "We aim to build lasting working relationships and solutions that continue to serve your business as it grows." },
          ],
        },
      },
      {
        key: "process",
        title: "Process section",
        enabled: true,
        content: {
          eyebrow: "How We Work",
          heading: "A Clear, Structured Process",
          subtitle: "From the first conversation to ongoing support, every engagement follows a simple, transparent path.",
          steps: [
            { number: "01", title: "Understand", description: "Understand the client's business requirements." },
            { number: "02", title: "Analyze", description: "Review the financial, business or technology requirements." },
            { number: "03", title: "Recommend", description: "Provide practical solutions and recommendations." },
            { number: "04", title: "Support", description: "Assist the client throughout the required process." },
          ],
        },
      },
      {
        key: "insights",
        title: "Insights section",
        enabled: true,
        content: {
          eyebrow: "Insights",
          heading: "Practical Business Insights",
          subtitle: "Short, useful reads on accounting, business setup and technology.",
        },
      },
      {
        key: "cta",
        title: "Call to action",
        enabled: true,
        content: {
          heading: "Let's Build a Stronger Business Together",
          text: "Have a business, financial or technology requirement? Talk to TV Clarity Capital today.",
          button_label: "Request a Consultation",
          button_link: "/consultation",
        },
      },
    ],
  },
  about: {
    slug: "about",
    title: "About Us",
    path: "/about",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "About Us",
          title: "About TV Clarity Capital",
          text: "A Monaragala-based professional services company bringing accounting, auditing, business registration, consulting and IT solutions together under one clear, trustworthy approach.",
        },
      },
    ],
  },
  services: {
    slug: "services",
    title: "Services",
    path: "/services",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "Our Services",
          title: "Professional Services Designed Around Your Business",
          text: "Five connected service lines covering finance, business setup, consulting and technology — so you can get clear, coordinated support from a single professional partner.",
        },
      },
    ],
  },
  "why-choose-us": {
    slug: "why-choose-us",
    title: "Why Choose Us",
    path: "/why-choose-us",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "Why Choose Us",
          title: "A Clarity-Focused Approach to Professional Services",
          text: "What sets TV Clarity Capital apart is not a single service but the way we work: professionally, clearly and with your long-term business success in mind.",
        },
      },
    ],
  },
  faq: {
    slug: "faq",
    title: "FAQ",
    path: "/faq",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "FAQ",
          title: "Frequently Asked Questions",
          text: "Clear answers to the questions we are asked most often about our services, location and how to get in touch.",
        },
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    path: "/contact",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "Contact Us",
          title: "Let's Talk About Your Business",
          text: "Whether you need accounting support, help registering a business, practical consulting or an IT solution, we are ready to listen and help you take the next step.",
        },
      },
    ],
  },
  blog: {
    slug: "blog",
    title: "Insights",
    path: "/blog",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "Insights",
          title: "Practical Insights for Your Business",
          text: "Short, useful articles on accounting, business setup, consulting and technology, written to help you make clearer decisions.",
        },
      },
    ],
  },
  consultation: {
    slug: "consultation",
    title: "Consultation Form",
    path: "/consultation",
    sections: [
      {
        key: "hero",
        title: "Hero",
        enabled: true,
        content: {
          eyebrow: "Consultation Request",
          title: "Tell Us About Your Requirement",
          text: "Answer a few short questions and we will get back to you with clear, practical next steps. It takes about three minutes.",
        },
      },
      {
        key: "success",
        title: "Success message",
        enabled: true,
        content: {
          heading: "Your consultation request has been received.",
          text: "Thank you for reaching out. Please keep your reference number for future communication. We will contact you using your preferred method.",
        },
      },
    ],
  },
};

/** Sidebar order for the CMS "Website Content" module. */
export const cmsPageSlugs = ["home", "about", "services", "why-choose-us", "faq", "contact", "blog", "consultation"];
