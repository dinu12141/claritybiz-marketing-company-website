import { Briefcase } from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blog";
import { defaultQuestions, type QuestionDef } from "@/data/consultation";
import { faqs, type FaqItem } from "@/data/faq";
import { images, type SiteImage } from "@/data/images";
import { pageDefaults, type PageDef, type SectionContent, type SectionDef } from "@/data/pages";
import { services, type Service, type ServiceSection } from "@/data/services";
import { site, syncDerivedNav } from "@/data/site";
import { iconByName, iconNameOf } from "@/lib/icons";
import { serviceOptions } from "@/lib/inquiry";
import { supabase } from "@/lib/supabase";
import type {
  BlogPostRow,
  FaqRow,
  PageRow,
  PageSectionRow,
  QuestionWithOptions,
  SeoSettingRow,
  ServiceAudienceJson,
  ServiceJourneyStepJson,
  ServiceRow,
  ServiceSectionJson,
  SiteSettingRow,
} from "@/lib/types";

/* ------------------------------------------------------------------ state */

const staticServices: Service[] = [...services];

export const staticServiceBySlug = (slug: string) => staticServices.find((service) => service.slug === slug);

const clonePages = (source: Record<string, PageDef>): Record<string, PageDef> =>
  JSON.parse(JSON.stringify(source)) as Record<string, PageDef>;

type SeoOverride = Partial<Pick<SeoSettingRow, "title" | "description" | "og_title" | "og_description">>;

export const cms = {
  loaded: false,
  source: "static" as "static" | "supabase",
  questions: { ...defaultQuestions } as Record<string, QuestionDef[]>,
  pages: clonePages(pageDefaults),
  seoPages: {} as Record<string, SeoOverride>,
  seoGlobal: null as Partial<SeoSettingRow> | null,
  settings: {} as Record<string, string>,
};

/* --------------------------------------------------------------- helpers */

export function getSection(pageSlug: string, key: string): SectionDef | null {
  const page = cms.pages[pageSlug];
  return page?.sections.find((section) => section.key === key) ?? null;
}

export function getContent(pageSlug: string, key: string): SectionContent {
  return getSection(pageSlug, key)?.content ?? {};
}

export function isSectionEnabled(pageSlug: string, key: string): boolean {
  return getSection(pageSlug, key)?.enabled ?? true;
}

export function text(content: SectionContent, key: string, fallback = ""): string {
  const value = content[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function lines(content: SectionContent, key: string, fallback: string[] = []): string[] {
  const value = content[key];
  if (Array.isArray(value)) {
    const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    return items.length ? items : fallback;
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }
  return fallback;
}

export function records(content: SectionContent, key: string): Record<string, string>[] {
  const value = content[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, string> => typeof item === "object" && item !== null);
}

export function getQuestions(serviceSlug: string): QuestionDef[] {
  return cms.questions[serviceSlug] ?? cms.questions.other ?? [];
}

export function getSeoOverride(path: string): SeoOverride {
  const page = cms.seoPages[path] ?? {};
  if (path !== "/" || !cms.seoGlobal) return page;
  // The homepage inherits the global site title/description unless overridden.
  return {
    title: page.title || cms.seoGlobal.title,
    description: page.description || cms.seoGlobal.description,
    og_title: page.og_title || cms.seoGlobal.og_title,
    og_description: page.og_description || cms.seoGlobal.og_description,
  };
}

const splitParagraphs = (value: string) =>
  value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const estimateReadTime = (paragraphs: string[]) => {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

/** Converts a static Service into the editable shape stored in the `services` table. */
export function staticServiceDefaults(slug: string): Partial<ServiceRow> {
  const base = staticServiceBySlug(slug);
  if (!base) return {};
  return {
    slug: base.slug,
    name: base.name,
    short_name: base.shortName,
    short_description: base.description,
    full_description: base.intro.join("\n\n"),
    icon: iconNameOf(base.icon),
    features: [...base.features],
    cta_text: base.cta.button,
    hero_title: base.heroTitle,
    hero_text: base.heroText,
    sections: base.sections.map((section) => ({
      title: section.title,
      description: section.description,
      icon: iconNameOf(section.icon),
    })),
    audience: base.audience ? { ...base.audience, items: [...base.audience.items] } : null,
    journey: base.journey ? base.journey.map((step) => ({ ...step })) : null,
    disclaimer: base.disclaimer ?? null,
    seo_title: base.seo.title,
    seo_description: base.seo.description,
  };
}

const isAudience = (value: unknown): value is ServiceAudienceJson =>
  typeof value === "object" && value !== null && Array.isArray((value as ServiceAudienceJson).items);

const isJourney = (value: unknown): value is ServiceJourneyStepJson[] =>
  Array.isArray(value) && value.every((step) => typeof step === "object" && step !== null && "step" in step);

const isSections = (value: unknown): value is ServiceSectionJson[] =>
  Array.isArray(value) && value.every((section) => typeof section === "object" && section !== null && "title" in section);

/** Builds a full public Service model from a database row, using static content as defaults. */
export function mergeServiceRow(row: ServiceRow): Service {
  const base = staticServiceBySlug(row.slug);
  const icon = iconByName(row.icon, base?.icon ?? Briefcase);
  const sections: ServiceSection[] =
    isSections(row.sections) && row.sections.length
      ? row.sections.map((section) => ({
          title: section.title,
          description: section.description,
          icon: iconByName(section.icon, icon),
        }))
      : (base?.sections ?? []);
  const image: SiteImage = row.image_url ? { src: row.image_url, alt: row.name } : (base?.image ?? images.officeDesk);
  const description = row.short_description || base?.description || "";

  return {
    dbId: row.id,
    slug: row.slug,
    path: `/services/${row.slug}`,
    name: row.name,
    shortName: row.short_name || base?.shortName || row.name,
    icon,
    theme: base?.theme ?? "consulting",
    image,
    secondary: base?.secondary ?? { image: images.officeDesk, caption: description },
    eyebrow: row.name,
    heroTitle: row.hero_title || base?.heroTitle || row.name,
    heroText: row.hero_text || base?.heroText || description,
    description,
    features: row.features && row.features.length ? row.features : (base?.features ?? []),
    intro: row.full_description ? splitParagraphs(row.full_description) : (base?.intro ?? [description]),
    sectionsTitle: base?.sectionsTitle ?? `What Our ${row.name} Cover`,
    sectionsSubtitle: base?.sectionsSubtitle ?? "",
    sections,
    audience: isAudience(row.audience) ? row.audience : base?.audience,
    journey: isJourney(row.journey) && row.journey.length ? row.journey : base?.journey,
    disclaimer: row.disclaimer || base?.disclaimer,
    cta: {
      title: base?.cta.title ?? `Discuss Your ${row.name} Requirement`,
      text: base?.cta.text ?? "Tell us about your requirement and we will explain how we can help in clear, practical terms.",
      button: row.cta_text || base?.cta.button || "Request a Consultation",
    },
    seo: {
      title: row.seo_title || base?.seo.title || `${row.name} | ${site.name}`,
      description: row.seo_description || base?.seo.description || description,
    },
  };
}

/* ---------------------------------------------------------- appliers */

export function applySettings(rows: SiteSettingRow[]) {
  const map: Record<string, string> = {};
  rows.forEach((row) => {
    if (row.value !== null && row.value !== undefined) map[row.key] = row.value;
  });
  cms.settings = map;
  const get = (key: string) => map[key]?.trim() || "";

  const phoneE164 = get("phone_e164") || site.phoneE164;
  const whatsappNumber = (get("whatsapp_number") || site.whatsappNumber).replace(/\D/g, "");
  const socialKeys: { key: string; label: string }[] = [
    { key: "linkedin_url", label: "LinkedIn" },
    { key: "instagram_url", label: "Instagram" },
    { key: "youtube_url", label: "YouTube" },
    { key: "x_url", label: "X" },
    { key: "tiktok_url", label: "TikTok" },
  ];

  Object.assign(site, {
    name: get("company_name") || site.name,
    shortName: get("short_name") || site.shortName,
    tagline: get("tagline") || site.tagline,
    description: get("description") || site.description,
    location: get("location") || site.location,
    phoneDisplay: get("phone_display") || site.phoneDisplay,
    phoneE164,
    phoneHref: `tel:${phoneE164}`,
    whatsappNumber,
    whatsappHref: `https://wa.me/${whatsappNumber}`,
    facebookUrl: get("facebook_url") || site.facebookUrl,
    email: get("email") || site.email,
    address: get("address") || site.address,
    businessHours: get("business_hours") || site.businessHours,
    socials: socialKeys.filter(({ key }) => get(key)).map(({ key, label }) => ({ key, label, url: get(key) })),
  } satisfies Partial<typeof site>);
}

export function applyServiceRows(rows: ServiceRow[]) {
  const enabled = rows.filter((row) => row.is_enabled).sort((a, b) => a.sort_order - b.sort_order);
  if (!enabled.length) return;
  const merged = enabled.map(mergeServiceRow);
  services.splice(0, services.length, ...merged);
  syncDerivedNav();
  serviceOptions.splice(0, serviceOptions.length, ...merged.map((service) => service.name), "General Inquiry / Not Sure Yet");
}

export function applyQuestions(rows: QuestionWithOptions[], serviceRows: ServiceRow[]) {
  const slugById = new Map(serviceRows.map((row) => [row.id, row.slug]));
  const grouped = new Map<string, QuestionWithOptions[]>();
  rows
    .filter((row) => row.is_enabled)
    .forEach((row) => {
      const slug = slugById.get(row.service_id);
      if (!slug) return;
      grouped.set(slug, [...(grouped.get(slug) ?? []), row]);
    });
  grouped.forEach((questions, slug) => {
    cms.questions[slug] = questions
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((question) => ({
        key: question.key,
        label: question.label,
        type: question.type,
        required: question.is_required,
        placeholder: question.placeholder ?? undefined,
        help: question.help_text ?? undefined,
        options: (question.options ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => option.label),
      }));
  });
}

export function applyPages(pages: PageRow[], sections: PageSectionRow[]) {
  const slugById = new Map(pages.map((page) => [page.id, page]));
  sections.forEach((row) => {
    const page = slugById.get(row.page_id);
    // Unpublished page → ignore CMS overrides and keep the built-in defaults.
    if (!page || !page.is_published) return;
    const target = cms.pages[page.slug];
    if (!target) return;
    const existing = target.sections.find((section) => section.key === row.key);
    const content = (row.content ?? {}) as SectionContent;
    if (existing) {
      existing.enabled = row.is_enabled;
      existing.content = { ...existing.content, ...content };
    } else {
      target.sections.push({ key: row.key, title: row.title ?? row.key, enabled: row.is_enabled, content });
    }
  });
}

export function applyFaqs(rows: FaqRow[]) {
  const enabled = rows.filter((row) => row.is_enabled).sort((a, b) => a.sort_order - b.sort_order);
  if (!enabled.length) return;
  const items: FaqItem[] = enabled.map((row) => ({ question: row.question, answer: row.answer }));
  faqs.splice(0, faqs.length, ...items);
}

export function blogPostFromRow(row: BlogPostRow): BlogPost {
  const content = splitParagraphs(row.content || "");
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category ?? "Insights",
    readTime: estimateReadTime(content),
    content,
    seo: {
      title: row.seo_title || `${row.title} | ${site.shortName}`,
      description: row.seo_description || row.excerpt || "",
    },
    image: row.featured_image_url ? { src: row.featured_image_url, alt: row.title } : undefined,
    author: row.author_name ?? undefined,
    publishedAt: row.published_at ?? undefined,
    tags: row.tags ?? undefined,
  };
}

export function applyBlogPosts(rows: BlogPostRow[]) {
  const published = rows.filter((row) => row.status === "published");
  blogPosts.splice(0, blogPosts.length, ...published.map(blogPostFromRow));
}

export function applySeo(rows: SeoSettingRow[]) {
  rows.forEach((row) => {
    if (row.page_path === "global") {
      cms.seoGlobal = row;
      return;
    }
    cms.seoPages[row.page_path] = {
      title: row.title,
      description: row.description,
      og_title: row.og_title,
      og_description: row.og_description,
    };
  });
  const global = cms.seoGlobal;
  if (!global) return;
  if (global.favicon_url) {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) {
      link.href = global.favicon_url;
      link.removeAttribute("type");
    }
  }
  const upsert = (attr: "name" | "property", key: string, value: string | null | undefined) => {
    if (!value) return;
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attr, key);
      document.head.appendChild(element);
    }
    element.setAttribute("content", value);
  };
  upsert("property", "og:image", global.og_image_url);
  upsert("name", "robots", global.robots);
  if (global.og_image_url) upsert("name", "twitter:card", "summary_large_image");
}

/* ------------------------------------------------------------- loader */

const TIMEOUT_MS = 6000;

/**
 * Loads CMS-managed content from Supabase and overlays it on the static
 * defaults. Resolves quietly (keeping static content) when Supabase is not
 * configured, unreachable, or the schema has not been installed yet.
 */
export async function loadCmsContent(): Promise<void> {
  const sb = supabase;
  if (!sb || cms.loaded) return;

  const work = Promise.all([
    sb.from("site_settings").select("*"),
    sb.from("services").select("*").order("sort_order"),
    sb.from("service_questions").select("*, options:service_question_options(*)").eq("is_enabled", true).order("sort_order"),
    sb.from("pages").select("*"),
    sb.from("page_sections").select("*"),
    sb.from("faqs").select("*").eq("is_enabled", true).order("sort_order"),
    sb.from("blog_posts").select("*").eq("status", "published").order("published_at", { ascending: false }),
    sb.from("seo_settings").select("*"),
  ]);
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS));

  try {
    const result = await Promise.race([work, timeout]);
    if (!result) return;
    const [settings, serviceRows, questionRows, pageRows, sectionRows, faqRows, postRows, seoRows] = result;

    if (!settings.error && settings.data) applySettings(settings.data as SiteSettingRow[]);
    if (!serviceRows.error && serviceRows.data) {
      applyServiceRows(serviceRows.data as ServiceRow[]);
      if (!questionRows.error && questionRows.data) {
        applyQuestions(questionRows.data as QuestionWithOptions[], serviceRows.data as ServiceRow[]);
      }
    }
    if (!pageRows.error && pageRows.data && !sectionRows.error && sectionRows.data) {
      applyPages(pageRows.data as PageRow[], sectionRows.data as PageSectionRow[]);
    }
    if (!faqRows.error && faqRows.data) applyFaqs(faqRows.data as FaqRow[]);
    if (!postRows.error && postRows.data) applyBlogPosts(postRows.data as BlogPostRow[]);
    if (!seoRows.error && seoRows.data) applySeo(seoRows.data as SeoSettingRow[]);

    cms.loaded = true;
    cms.source = "supabase";
  } catch {
    // Keep static content; the public site must never break because of the CMS.
  }
}
