import { services } from "./services";

export type SocialLink = { key: string; label: string; url: string };

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  positioning: string;
  description: string;
  location: string;
  locality: string;
  country: string;
  phoneDisplay: string;
  phoneE164: string;
  phoneHref: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappHref: string;
  whatsappNote: string;
  facebookUrl: string;
  email: string;
  address: string;
  businessHours: string;
  socials: SocialLink[];
  copyrightYear: number;
};

/**
 * Site-wide business settings. These defaults are overridden at startup by
 * the values managed in the admin portal (site_settings table) when Supabase
 * is configured — see src/content/cms.ts.
 */
export const site: SiteSettings = {
  name: "TV Clarity Capital (Pvt) Ltd",
  shortName: "TV Clarity Capital",
  tagline: "Our Capital is Your Success",
  positioning: "Professional Solutions for Finance, Business & Technology",
  description:
    "TV Clarity Capital (Pvt) Ltd provides reliable accounting, auditing, business registration, IT and professional consulting solutions designed to help individuals and businesses operate with clarity, confidence and growth.",
  location: "Monaragala, Sri Lanka",
  locality: "Monaragala",
  country: "Sri Lanka",
  phoneDisplay: "071 405 3449",
  phoneE164: "+94714053449",
  phoneHref: "tel:+94714053449",
  whatsappNumber: "94764303421",
  whatsappDisplay: "076 430 3421",
  whatsappHref: "https://wa.me/94764303421",
  whatsappNote: "Fastest response · Recommended for instant inquiries",
  facebookUrl: "https://www.facebook.com/share/1Gr2TQKFwW/",
  email: "tvclaritycapital@gmail.com",
  address: "Monaragala, Sri Lanka",
  businessHours: "Monday – Saturday: 8:30 AM – 5:30 PM",
  socials: [],
  copyrightYear: 2026,
};

export const whatsappWithMessage = (message: string) =>
  `${site.whatsappHref}?text=${encodeURIComponent(message)}`;

export type NavItem = {
  label: string;
  to: string;
  children?: { label: string; to: string; description: string }[];
};

const serviceNavChildren = () =>
  services.map((service) => ({ label: service.name, to: service.path, description: service.description }));

export const primaryNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  {
    label: "Services",
    to: "/services",
    // Always reflects the current (CMS-managed) service list.
    get children() {
      return serviceNavChildren();
    },
  },
  { label: "Why Choose Us", to: "/why-choose-us" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export const footerQuickLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Why Choose Us", to: "/why-choose-us" },
  { label: "FAQ", to: "/faq" },
  { label: "Insights", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Request a Consultation", to: "/consultation" },
];

const buildFooterServiceLinks = () => services.map((service) => ({ label: service.shortName, to: service.path }));

export const footerServiceLinks: { label: string; to: string }[] = buildFooterServiceLinks();

/** Re-derives navigation lists after the service list changes (CMS overlay). */
export function syncDerivedNav() {
  footerServiceLinks.splice(0, footerServiceLinks.length, ...buildFooterServiceLinks());
}

/** Every top-level route the SPA knows about (used for base-path detection). */
export const knownRoutePaths = [
  "/about",
  "/services",
  "/why-choose-us",
  "/faq",
  "/contact",
  "/consultation",
  "/blog",
  "/privacy-policy",
  "/terms",
  "/admin",
];
