import type { Locale } from "@/lib/locales";

// Pages secondaires et leurs adresses dans chaque langue (doivent correspondre à locales/*.json → pages.<id>.slug).
export const PAGE_IDS = ["battu", "carte", "legal"] as const;
export type PageId = (typeof PAGE_IDS)[number];

export const SLUGS: Record<PageId, Record<Locale, string>> = {
  battu: { fr: "gateau-battu-du-vimeu", en: "gateau-battu" },
  carte: { fr: "carte", en: "menu" },
  legal: { fr: "mentions-legales", en: "legal" },
};

export const pagePath = (id: PageId, lang: Locale) => `/${lang}/${SLUGS[id][lang]}`;

export const pageOfSlug = (slug: string, lang: Locale) => PAGE_IDS.find((id) => SLUGS[id][lang] === slug) ?? null;
