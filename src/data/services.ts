import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calculator,
  ChartColumn,
  ChartLine,
  ChartPie,
  ClipboardCheck,
  ClipboardList,
  CloudCog,
  Code,
  Compass,
  FileCheck,
  FilePen,
  FileSearch,
  FileStack,
  FileText,
  Globe,
  Goal,
  Handshake,
  Headset,
  Layers,
  Lightbulb,
  ListChecks,
  MessagesSquare,
  MonitorSmartphone,
  Puzzle,
  Rocket,
  Scale,
  SearchCheck,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Signpost,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { images, type SiteImage } from "@/data/images";

export type ServiceSection = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Service = {
  /** Database id when the service is managed from the CMS */
  dbId?: string;
  slug: string;
  path: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  /** Small hero label */
  eyebrow: string;
  /** Page H1 */
  heroTitle: string;
  /** Hero supporting line */
  heroText: string;
  /** Card description (home / services overview) */
  description: string;
  /** Card bullet features */
  features: string[];
  /** Intro paragraphs on the detail page */
  intro: string[];
  /** Detail sections */
  sectionsTitle: string;
  sectionsSubtitle: string;
  sections: ServiceSection[];
  audience?: { title: string; subtitle: string; items: string[] };
  journey?: { step: string; description: string }[];
  disclaimer?: string;
  cta: { title: string; text: string; button: string };
  seo: { title: string; description: string };
  /** Visual accent theme used on the detail hero */
  theme: "finance" | "audit" | "registration" | "consulting" | "technology";
  /** Featured photograph for cards and the detail hero */
  image: SiteImage;
  /** Complementary photograph and caption shown within the detail page */
  secondary: { image: SiteImage; caption: string };
};

export const services: Service[] = [
  {
    slug: "accounting",
    path: "/services/accounting",
    name: "Accounting Services",
    shortName: "Accounting",
    icon: Calculator,
    theme: "finance",
    image: images.accounting,
    secondary: {
      image: images.officeDesk,
      caption: "Organized records, clear reporting and dependable day-to-day accounting support.",
    },
    eyebrow: "Accounting Services",
    heroTitle: "Accounting Services",
    heroText:
      "Professional accounting support to help you maintain accurate financial records, prepare accounts and gain real clarity over the numbers that drive your business.",
    description:
      "Professional accounting support to help maintain accurate financial records and improve financial clarity.",
    features: [
      "Bookkeeping",
      "Financial records",
      "Accounts preparation",
      "Financial reporting",
      "Business accounting support",
    ],
    intro: [
      "Accurate accounting is the foundation of every well-run business. TV Clarity Capital provides practical accounting support that keeps your financial records organized, up to date and ready for decision-making.",
      "Whether you need ongoing bookkeeping, help preparing accounts or clearer financial reporting, our support is structured around your business, its size and the way you actually operate.",
    ],
    sectionsTitle: "What Our Accounting Support Covers",
    sectionsSubtitle:
      "Structured accounting assistance designed to keep your records accurate, organized and useful.",
    sections: [
      {
        title: "Bookkeeping",
        description:
          "Systematic recording of day-to-day transactions so income, expenses, receipts and payments are captured accurately and consistently.",
        icon: BookOpen,
      },
      {
        title: "Financial Records",
        description:
          "Organizing and maintaining ledgers, supporting documents and schedules so your financial history is complete and easy to reference.",
        icon: FileStack,
      },
      {
        title: "Accounts Preparation",
        description:
          "Preparation of periodic accounts and statements from your records, presented clearly for owners, partners and other stakeholders.",
        icon: ClipboardList,
      },
      {
        title: "Financial Reporting",
        description:
          "Clear, readable reports that summarize performance and position, helping you understand where the business stands.",
        icon: ChartColumn,
      },
      {
        title: "Business Accounting Support",
        description:
          "Ongoing assistance with accounting questions, processes and routines so your team can operate with confidence.",
        icon: Handshake,
      },
      {
        title: "Financial Organization",
        description:
          "Putting sensible structure around documents, accounts and workflows so information is always where it should be.",
        icon: Layers,
      },
    ],
    audience: {
      title: "Who Is This For?",
      subtitle:
        "Our accounting support is suited to a wide range of individuals and organizations that value accurate, well-organized financial information.",
      items: [
        "Small businesses",
        "Entrepreneurs",
        "Startups",
        "Growing businesses",
        "Organizations requiring accounting support",
      ],
    },
    cta: {
      title: "Discuss Your Accounting Needs",
      text: "Tell us about your business and the accounting support you require. We will explain how we can help in clear, practical terms.",
      button: "Discuss Your Accounting Needs",
    },
    seo: {
      title: "Accounting Services in Monaragala | TV Clarity Capital (Pvt) Ltd",
      description:
        "Professional accounting services in Monaragala, Sri Lanka: bookkeeping, financial records, accounts preparation, financial reporting and business accounting support from TV Clarity Capital.",
    },
  },
  {
    slug: "auditing-financial",
    path: "/services/auditing-financial",
    name: "Auditing & Financial Services",
    shortName: "Auditing & Financial",
    icon: FileSearch,
    theme: "audit",
    image: images.auditing,
    secondary: {
      image: images.clarity,
      caption: "An objective, structured view of your finances, with clear documentation at every step.",
    },
    eyebrow: "Auditing & Financial Services",
    heroTitle: "Auditing & Financial Services",
    heroText:
      "Structured financial and auditing support that helps businesses improve financial visibility, strengthen control and make better-informed decisions.",
    description:
      "Structured financial and auditing support to help businesses maintain better financial visibility and control.",
    features: [
      "Audit support",
      "Financial review",
      "Financial analysis",
      "Documentation support",
      "Compliance-oriented assistance",
    ],
    intro: [
      "Good financial control depends on reliable information and an objective view of how your business is performing. TV Clarity Capital provides auditing and financial support services designed to bring structure, visibility and confidence to your finances.",
      "From reviewing financial records and preparing documentation to analysing results and supporting audit processes, we help you approach your finances in an organized and compliance-minded way.",
    ],
    sectionsTitle: "Auditing & Financial Support Areas",
    sectionsSubtitle:
      "Practical services that help you review, understand and strengthen your financial position.",
    sections: [
      {
        title: "Financial Review",
        description:
          "An organized review of your financial records and statements to identify gaps, inconsistencies and areas that need attention.",
        icon: SearchCheck,
      },
      {
        title: "Audit Support",
        description:
          "Assistance in preparing records, schedules and supporting documents so audit processes run smoothly and efficiently.",
        icon: ClipboardCheck,
      },
      {
        title: "Financial Analysis",
        description:
          "Analysis of performance, cost structures and trends to give you a clearer picture of what is driving results.",
        icon: ChartLine,
      },
      {
        title: "Financial Documentation",
        description:
          "Support in organizing and preparing the documentation needed for reviews, reporting and stakeholder requirements.",
        icon: FileText,
      },
      {
        title: "Business Financial Guidance",
        description:
          "Clear, practical guidance on financial matters affecting your business, explained in language that makes sense to owners and managers.",
        icon: Compass,
      },
      {
        title: "Financial Control Support",
        description:
          "Help in strengthening internal routines, checks and reporting so financial information stays reliable over time.",
        icon: ShieldCheck,
      },
    ],
    disclaimer:
      "Specific audit and professional services are subject to the applicable requirements, scope and qualifications relevant to the engagement.",
    cta: {
      title: "Strengthen Your Financial Visibility",
      text: "Talk to us about financial review, audit support or analysis for your business. We will outline a clear and practical way forward.",
      button: "Request Financial Support",
    },
    seo: {
      title: "Auditing & Financial Services in Monaragala | TV Clarity Capital",
      description:
        "Audit support, financial review, financial analysis and documentation services in Monaragala, Sri Lanka. TV Clarity Capital helps businesses improve financial visibility and control.",
    },
  },
  {
    slug: "business-registration",
    path: "/services/business-registration",
    name: "Business Registration",
    shortName: "Business Registration",
    icon: Building2,
    theme: "registration",
    image: images.registration,
    secondary: {
      image: images.contact,
      caption: "From the first conversation to completed paperwork, guidance at every step of your setup.",
    },
    eyebrow: "Business Registration",
    heroTitle: "Business Registration & Setup Support",
    heroText:
      "Guidance and documentation support for registering and setting up your business, so you can start your journey on a clear and professional footing.",
    description:
      "Guidance and support for setting up and registering your business with a professional approach.",
    features: [
      "Business registration guidance",
      "Company documentation",
      "Registration support",
      "Business setup consultation",
      "Documentation assistance",
    ],
    intro: [
      "Starting a business involves decisions and paperwork that can feel overwhelming. TV Clarity Capital provides guidance and assistance throughout the business registration and setup process, helping you understand each step and prepare what is required.",
      "We support you in organizing documentation, understanding the registration process and setting up your business structure in a clear, methodical way, so you can focus on building the business itself.",
    ],
    sectionsTitle: "Registration & Setup Support",
    sectionsSubtitle:
      "Step-by-step assistance for new and growing businesses preparing to register or restructure.",
    sections: [
      {
        title: "Business Registration Guidance",
        description:
          "Clear explanations of the registration options and steps relevant to your business, so you can make informed choices.",
        icon: Signpost,
      },
      {
        title: "Company Documentation Support",
        description:
          "Assistance in compiling, organizing and reviewing the documents typically required for registration and setup.",
        icon: FileStack,
      },
      {
        title: "Business Setup Consultation",
        description:
          "Practical consultation on structuring your business, initial records and the routines you will need from day one.",
        icon: MessagesSquare,
      },
      {
        title: "Registration Process Guidance",
        description:
          "Support in understanding the sequence of steps in the registration process and what to prepare at each stage.",
        icon: ListChecks,
      },
      {
        title: "Documentation Preparation Assistance",
        description:
          "Hands-on help preparing forms and supporting paperwork accurately and completely.",
        icon: FilePen,
      },
      {
        title: "Post-Registration Foundations",
        description:
          "Guidance on accounting, record-keeping and basic systems to put in place once your business is registered.",
        icon: Building2,
      },
    ],
    audience: {
      title: "Who Is This For?",
      subtitle:
        "Business registration support is ideal for anyone taking the first formal step with a new venture.",
      items: [
        "First-time entrepreneurs",
        "Sole proprietors formalizing a business",
        "Partnerships and small companies",
        "Startups preparing to launch",
        "Existing businesses restructuring or expanding",
      ],
    },
    disclaimer:
      "TV Clarity Capital provides guidance and documentation assistance. Registration decisions and approvals remain with the relevant authorities and are subject to their applicable requirements.",
    cta: {
      title: "Start Your Business Journey",
      text: "Planning to register a new business? Let's discuss your plans and the support you need to get set up properly.",
      button: "Start Your Business Journey",
    },
    seo: {
      title: "Business Registration Support in Monaragala | TV Clarity Capital",
      description:
        "Business registration guidance, company documentation support and business setup consultation in Monaragala, Sri Lanka from TV Clarity Capital (Pvt) Ltd.",
    },
  },
  {
    slug: "business-consulting",
    path: "/services/business-consulting",
    name: "Business Consulting",
    shortName: "Business Consulting",
    icon: Briefcase,
    theme: "consulting",
    image: images.consulting,
    secondary: {
      image: images.landscape,
      caption: "Practical growth guidance for businesses in Monaragala and across Sri Lanka.",
    },
    eyebrow: "Business Consulting",
    heroTitle: "Business Consulting",
    heroText:
      "Practical business consultation that helps organizations plan clearly, improve how they operate and make well-informed decisions about growth.",
    description:
      "Practical business consultation to help organizations make informed decisions and improve operations.",
    features: [
      "Business planning",
      "Business process improvement",
      "Financial planning support",
      "Operational consultation",
      "Business growth guidance",
    ],
    intro: [
      "Every business reaches points where an outside perspective helps. TV Clarity Capital provides business consulting that is grounded in practical experience with finance, operations and technology, and focused on decisions you can actually act on.",
      "We work with you to understand your situation, analyse what is happening, and recommend realistic improvements that fit your resources and goals.",
    ],
    sectionsTitle: "Consulting Focus Areas",
    sectionsSubtitle:
      "Consultation designed to bring structure, clarity and momentum to your business decisions.",
    sections: [
      {
        title: "Business Planning",
        description:
          "Developing clear plans that define direction, priorities and the practical steps needed to move forward.",
        icon: Target,
      },
      {
        title: "Business Process Improvement",
        description:
          "Reviewing how work gets done and identifying simpler, more efficient ways to run day-to-day operations.",
        icon: Workflow,
      },
      {
        title: "Operational Guidance",
        description:
          "Practical advice on organizing resources, responsibilities and routines so the business runs more smoothly.",
        icon: Settings2,
      },
      {
        title: "Financial Planning Support",
        description:
          "Support in budgeting, cash-flow thinking and financial priorities that keep plans grounded in reality.",
        icon: ChartPie,
      },
      {
        title: "Business Growth Strategy",
        description:
          "Guidance on sustainable growth: where to focus, what to build and how to sequence the next steps.",
        icon: TrendingUp,
      },
      {
        title: "Decision Support",
        description:
          "Structured analysis and clear options so important decisions are made with confidence rather than guesswork.",
        icon: Scale,
      },
    ],
    journey: [
      {
        step: "Discuss",
        description: "We start by listening: your business, your goals and the challenges you are facing.",
      },
      {
        step: "Analyze",
        description: "We review the relevant information to understand what is really driving the situation.",
      },
      {
        step: "Recommend",
        description: "We present practical, prioritized recommendations that fit your business and resources.",
      },
      {
        step: "Implement",
        description: "We support you as changes are put into practice, keeping things clear and manageable.",
      },
      {
        step: "Review",
        description: "We review progress with you and refine the approach as your business evolves.",
      },
    ],
    cta: {
      title: "Let's Talk About Your Business Goals",
      text: "Whether you are planning, improving or growing, a focused conversation is the best place to begin.",
      button: "Book a Consultation",
    },
    seo: {
      title: "Business Consulting in Monaragala, Sri Lanka | TV Clarity Capital",
      description:
        "Business planning, process improvement, financial planning support and growth guidance from TV Clarity Capital (Pvt) Ltd, Monaragala. Practical consulting for informed decisions.",
    },
  },
  {
    slug: "it-solutions",
    path: "/services/it-solutions",
    name: "IT Solutions",
    shortName: "IT Solutions",
    icon: MonitorSmartphone,
    theme: "technology",
    image: images.itSolutions,
    secondary: {
      image: images.heroAbstract,
      caption: "Modern digital solutions that simplify how your business runs and grows.",
    },
    eyebrow: "IT Solutions",
    heroTitle: "IT Solutions for Modern Businesses",
    heroText:
      "Practical technology and digital solutions that help businesses modernize, automate routine work and operate more efficiently.",
    description:
      "Technology solutions that help businesses modernize, automate and operate more efficiently.",
    features: [
      "Business websites",
      "Business software",
      "IT consultation",
      "Digital solutions",
      "Process automation",
    ],
    intro: [
      "Alongside its finance and business services, TV Clarity Capital supports businesses with practical IT and digital solutions. Technology should make a business simpler to run, easier to find and better at serving its customers.",
      "We help you identify where technology adds real value, then plan and deliver solutions that fit your operations, from a professional website to software that streamlines your daily processes.",
    ],
    sectionsTitle: "IT & Digital Solutions",
    sectionsSubtitle:
      "Technology services focused on practical results for your business.",
    sections: [
      {
        title: "Business Websites",
        description:
          "Professional, mobile-friendly websites that present your business clearly and help customers reach you.",
        icon: Globe,
      },
      {
        title: "Web Applications",
        description:
          "Custom web-based applications built around the specific workflows and needs of your organization.",
        icon: AppWindow,
      },
      {
        title: "Business Software",
        description:
          "Software solutions that support your day-to-day operations, reporting and record-keeping.",
        icon: Code,
      },
      {
        title: "ERP / POS Solutions",
        description:
          "Point-of-sale and resource planning solutions that bring sales, stock and finance information together.",
        icon: ShoppingCart,
      },
      {
        title: "CRM Solutions",
        description:
          "Tools to organize customer information, follow-ups and communication in one place.",
        icon: Users,
      },
      {
        title: "Process Automation",
        description:
          "Automating repetitive tasks to save time, reduce errors and free your team for higher-value work.",
        icon: Bot,
      },
      {
        title: "IT Consultation",
        description:
          "Independent advice on technology choices, systems and priorities that make sense for your business.",
        icon: Headset,
      },
      {
        title: "Digital Transformation",
        description:
          "Step-by-step guidance for moving manual processes into efficient, connected digital systems.",
        icon: CloudCog,
      },
    ],
    cta: {
      title: "Discuss Your IT Requirement",
      text: "Have a website, software or automation need? Let's talk about a practical solution that fits your business.",
      button: "Discuss Your IT Requirement",
    },
    seo: {
      title: "IT Solutions in Monaragala | Websites, Software & Automation | TV Clarity Capital",
      description:
        "Business websites, web applications, business software, ERP/POS, CRM, process automation and IT consultation in Monaragala, Sri Lanka from TV Clarity Capital (Pvt) Ltd.",
    },
  },
];

export const getServiceBySlug = (slug: string | undefined) =>
  services.find((service) => service.slug === slug);

/* Shared content blocks used across pages */

export const whyChooseUs = [
  {
    number: "01",
    title: "Professional Approach",
    description:
      "Every engagement is handled with care, structure and attention to detail, from the first conversation to the final deliverable.",
    icon: Briefcase,
  },
  {
    number: "02",
    title: "Clear & Practical Guidance",
    description:
      "We explain financial, business and technical matters in plain language, so you always understand your options and next steps.",
    icon: Lightbulb,
  },
  {
    number: "03",
    title: "Business-Focused Solutions",
    description:
      "Our recommendations are shaped around your business, its size and its goals, not around a one-size-fits-all template.",
    icon: Target,
  },
  {
    number: "04",
    title: "Finance & Technology Expertise",
    description:
      "Combining accounting, business and IT capabilities allows us to solve problems that sit between departments.",
    icon: Puzzle,
  },
  {
    number: "05",
    title: "Personalized Support",
    description:
      "You work directly with people who understand your situation and are accessible when you need them.",
    icon: Handshake,
  },
  {
    number: "06",
    title: "Long-Term Business Mindset",
    description:
      "We aim to build lasting working relationships and solutions that continue to serve your business as it grows.",
    icon: Goal,
  },
];

export const process = [
  {
    number: "01",
    title: "Understand",
    description: "Understand the client's business requirements.",
    icon: MessagesSquare,
  },
  {
    number: "02",
    title: "Analyze",
    description: "Review the financial, business or technology requirements.",
    icon: SearchCheck,
  },
  {
    number: "03",
    title: "Recommend",
    description: "Provide practical solutions and recommendations.",
    icon: Lightbulb,
  },
  {
    number: "04",
    title: "Support",
    description: "Assist the client throughout the required process.",
    icon: Handshake,
  },
];

export const coreValues = [
  {
    title: "Integrity",
    description: "We act honestly and responsibly, and we give advice we would follow ourselves.",
    icon: ShieldCheck,
  },
  {
    title: "Professionalism",
    description: "Structured, careful work with respect for your time, information and goals.",
    icon: Briefcase,
  },
  {
    title: "Transparency",
    description: "Clear communication about scope, approach and progress at every stage.",
    icon: FileCheck,
  },
  {
    title: "Responsibility",
    description: "We take ownership of the work we commit to and follow it through.",
    icon: Scale,
  },
  {
    title: "Innovation",
    description: "We apply practical technology and better methods wherever they create real value.",
    icon: Zap,
  },
  {
    title: "Client Focus",
    description: "Your requirements shape the solution; your success is how we measure ours.",
    icon: Users,
  },
];

export const businessAreas = [
  { title: "Finance & Accounting", icon: Calculator, to: "/services/accounting" },
  { title: "Auditing & Financial Review", icon: FileSearch, to: "/services/auditing-financial" },
  { title: "Business Registration", icon: Building2, to: "/services/business-registration" },
  { title: "Business Consulting", icon: Briefcase, to: "/services/business-consulting" },
  { title: "IT & Digital Solutions", icon: MonitorSmartphone, to: "/services/it-solutions" },
  { title: "Professional Services", icon: Rocket, to: "/services" },
];
