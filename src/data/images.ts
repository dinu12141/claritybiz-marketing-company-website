import heroAbstract from "@/assets/images/hero-abstract.jpg";
import officeDesk from "@/assets/images/office-desk.jpg";
import accounting from "@/assets/images/accounting.jpg";
import auditing from "@/assets/images/auditing.jpg";
import registration from "@/assets/images/business-registration.jpg";
import consulting from "@/assets/images/business-consulting.jpg";
import itSolutions from "@/assets/images/it-solutions.jpg";
import clarity from "@/assets/images/clarity-compass.jpg";
import contact from "@/assets/images/contact-desk.jpg";
import landscape from "@/assets/images/sri-lanka-landscape.jpg";

export type SiteImage = { src: string; alt: string };

/** Central registry of site imagery (bundled and inlined at build time). */
export const images = {
  heroAbstract: {
    src: heroAbstract,
    alt: "Abstract navy blue background with golden growth curves and digital data lines",
  },
  officeDesk: {
    src: officeDesk,
    alt: "Neatly organized professional workspace with financial documents, calculator and laptop",
  },
  accounting: {
    src: accounting,
    alt: "Calculator, pen and financial ledgers on an accountant's desk",
  },
  auditing: {
    src: auditing,
    alt: "Magnifying glass resting over financial reports and charts",
  },
  registration: {
    src: registration,
    alt: "Business registration documents, folder, stamp and pen on a desk",
  },
  consulting: {
    src: consulting,
    alt: "Business planning notebook with strategy sketches beside a tablet showing charts",
  },
  itSolutions: {
    src: itSolutions,
    alt: "Laptop displaying an analytics dashboard in a modern technology workspace",
  },
  clarity: {
    src: clarity,
    alt: "Compass resting on business plans, symbolizing clarity and direction",
  },
  contact: {
    src: contact,
    alt: "Welcoming office desk with a phone, notebook and pen in soft daylight",
  },
  landscape: {
    src: landscape,
    alt: "Lush green hills and paddy fields in rural Sri Lanka",
  },
} satisfies Record<string, SiteImage>;

const categoryImages: Record<string, SiteImage> = {
  Accounting: images.accounting,
  "Auditing & Financial": images.auditing,
  "Business Registration": images.registration,
  "Business Consulting": images.consulting,
  "IT Solutions": images.itSolutions,
};

/** Picks a fitting image for an insights/blog category. */
export const imageForCategory = (category: string): SiteImage =>
  categoryImages[category] ?? images.officeDesk;
