import site from "@/data/site.json";
import produits from "@/data/produits.json";
import { getDict, locales, type Locale } from "@/lib/i18n";
import { weekHours } from "@/lib/hours";
import { pagePath, type PageId } from "@/lib/pages";

const BUSINESS = `${site.url}/#bakery`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function business(lang: Locale) {
  const d = getDict(lang);
  const items = produits.items as Record<string, { price: number | null }>;
  return {
    "@type": ["Bakery", "CafeOrCoffeeShop"],
    "@id": BUSINESS,
    name: site.fullName,
    alternateName: [site.name, site.altName, "Boulangerie Fréville Amiens"],
    description: d.meta.description,
    url: `${site.url}/${lang}`,
    image: [`${site.url}/og.jpg`, `${site.url}/media/hero/gateau-battu-tranche.jpg`, `${site.url}/media/salon-de-the/facade-enseigne.jpg`],
    logo: `${site.url}/icon.svg`,
    telephone: site.phoneIntl,
    priceRange: "€",
    servesCuisine: ["Pâtisserie", "Spécialités picardes", "Salon de thé"],
    foundingDate: String(site.since),
    address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressRegion: site.address.region, addressCountry: site.address.country },
    hasMap: site.mapsUrl,
    openingHoursSpecification: weekHours().flatMap((slots, i) => slots.map(([opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAYS[i]}`, opens, closes }))),
    // Note Google relevée à la main (date dans data/site.json → rating.checked) : à mettre à jour de temps en temps
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5, worstRating: 1 },
    sameAs: [site.instagram, site.facebook],
    acceptsReservations: false,
    knowsLanguage: ["fr", "en"],
    hasMenu: `${site.url}${pagePath("carte", lang)}`,
    makesOffer: Object.entries(items)
      .filter(([, it]) => it.price !== null)
      .map(([id, it]) => ({
        "@type": "Offer",
        price: it.price!.toFixed(2),
        priceCurrency: "EUR",
        itemOffered: { "@type": "Product", name: d.products[id as keyof typeof d.products].name },
      })),
  };
}

/** Données structurées de l'accueil : Bakery + CafeOrCoffeeShop, horaires, note Google, FAQ. */
export function homeJsonLd(lang: Locale) {
  const d = getDict(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.fullName, inLanguage: [...locales], publisher: { "@id": BUSINESS } },
      business(lang),
      { "@type": "FAQPage", mainEntity: d.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

/** Données structurées d'une page secondaire : article (gâteau battu) ou menu (carte), plus fil d'Ariane. */
export function pageJsonLd(lang: Locale, id: PageId) {
  const d = getDict(lang);
  const url = `${site.url}${pagePath(id, lang)}`;
  const title = id === "battu" ? d.pages.battu.title : id === "carte" ? d.pages.carte.title : d.pages.legal.title;
  const main =
    id === "battu"
      ? {
          "@type": "Article",
          "@id": `${url}#article`,
          headline: d.pages.battu.title,
          description: d.pages.battu.metaDescription,
          inLanguage: lang,
          image: `${site.url}/media/hero/gateau-battu-tranche.jpg`,
          author: { "@id": BUSINESS },
          publisher: { "@id": BUSINESS },
          mainEntityOfPage: url,
          about: { "@type": "Thing", name: "Gâteau battu", sameAs: "https://fr.wikipedia.org/wiki/G%C3%A2teau_battu" },
        }
      : id === "carte"
        ? {
            "@type": "Menu",
            "@id": `${url}#menu`,
            name: d.pages.carte.title,
            inLanguage: lang,
            hasMenuSection: produits.categories.map((c) => ({
              "@type": "MenuSection",
              name: d.categories[c.id as keyof typeof d.categories],
              hasMenuItem: c.items.map((it) => {
                const p = (produits.items as Record<string, { price: number | null }>)[it];
                return { "@type": "MenuItem", name: d.products[it as keyof typeof d.products].name, ...(p.price !== null ? { offers: { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: "EUR" } } : {}) };
              }),
            })),
          }
        : null;
  return {
    "@context": "https://schema.org",
    "@graph": [
      business(lang),
      ...(main ? [main] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: `${site.url}/${lang}` },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };
}
