import { useEffect } from "react";
import { getSeoOverride } from "@/content/cms";
import { site } from "@/data/site";

type SeoOptions = {
  title: string;
  description: string;
  /** Route path, e.g. "/services/accounting" */
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  type?: "website" | "article";
  /** JSON-LD structured data objects */
  jsonLd?: Record<string, unknown>[];
};

const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export const buildLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["AccountingService", "FinancialService", "ProfessionalService"],
  name: site.name,
  alternateName: site.shortName,
  slogan: site.tagline,
  description: site.description,
  image: "https://claritybiz-marketing-company-website.vercel.app/og-image.jpg",
  telephone: site.phoneE164,
  priceRange: "$$",
  currenciesAccepted: "LKR, USD",
  paymentAccepted: "Cash, Bank Transfer, Online",
  ...(site.email ? { email: site.email } : {}),
  url: typeof window !== "undefined" ? window.location.origin : "https://claritybiz-marketing-company-website.vercel.app",
  sameAs: [site.facebookUrl, ...site.socials.map((social) => social.url)].filter(Boolean),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressLocality: site.locality,
    addressRegion: "Uva Province",
    postalCode: "91200",
    addressCountry: "LK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 6.8728,
    longitude: 81.3507,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30",
      closes: "17:30",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Monaragala" },
    { "@type": "AdministrativeArea", name: "Uva Province" },
    { "@type": "Country", name: "Sri Lanka" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Business, Finance & IT Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Accounting Services", description: "Accurate financial records, bookkeeping and financial clarity." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Auditing & Financial Services", description: "Structured financial auditing, compliance and control." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business Registration", description: "Private Limited company incorporation and secretarial support in Sri Lanka." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business Consulting", description: "Strategic and operational business consulting for sustainable growth." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "IT Solutions", description: "Digital transformation, web applications and software solutions for business." } },
    ],
  },
  knowsAbout: ["Accounting", "Auditing", "Business Registration", "Business Consulting", "IT Solutions", "Tax Advisory", "Bookkeeping"],
});

/**
 * Sets per-page document metadata (title, description, Open Graph, canonical)
 * and injects JSON-LD structured data. Page-level values managed in the admin
 * SEO module override the defaults passed in by the page.
 */
export function useSeo({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  type = "website",
  jsonLd = [],
}: SeoOptions) {
  useEffect(() => {
    const override = getSeoOverride(path);
    const finalTitle = override.title || title;
    const finalDescription = override.description || description;
    const finalOgTitle = override.og_title || ogTitle || finalTitle;
    const finalOgDescription = override.og_description || ogDescription || finalDescription;

    const url = `${window.location.origin}${path}`;
    document.title = finalTitle;
    upsertMeta("name", "description", finalDescription);
    upsertMeta("property", "og:title", finalOgTitle);
    upsertMeta("property", "og:description", finalOgDescription);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", site.name);
    upsertMeta("name", "twitter:title", finalOgTitle);
    upsertMeta("name", "twitter:description", finalOgDescription);
    upsertCanonical(url);

    const scripts = jsonLd.map((data) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "true");
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      scripts.forEach((script) => script.remove());
    };
    // Structured data is derived from the other options; serialize for stable deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, ogTitle, ogDescription, type, JSON.stringify(jsonLd)]);
}
