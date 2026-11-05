import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import produits from "@/data/produits.json";
import { altOf, fill, getDict, isLocale, locales, type Dict, type Locale } from "@/lib/i18n";
import { formatDay, price } from "@/lib/format";
import { img } from "@/lib/media";
import { PAGE_IDS, pageOfSlug, pagePath, SLUGS, type PageId } from "@/lib/pages";
import { pageJsonLd } from "@/lib/jsonld";
import { Reveal } from "@/components/Reveal";
import { OrderLink } from "@/components/OrderLink";
import { OpenStatus } from "@/components/OpenStatus";
import { PhoneIcon } from "@/components/icons";

type Item = { price: number | null; from?: boolean; availability: "shop" | "order" | "both" };

export function generateStaticParams() {
  return locales.flatMap((lang) => PAGE_IDS.map((id) => ({ lang, slug: SLUGS[id][lang] })));
}
export const dynamicParams = false;

function resolve(lang: string, slug: string): { lang: Locale; id: PageId } | null {
  if (!isLocale(lang)) return null;
  const id = pageOfSlug(slug, lang);
  return id ? { lang, id } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) return {};
  const d = getDict(r.lang);
  const p = d.pages[r.id];
  const description = "metaDescription" in p ? p.metaDescription : d.meta.description;
  return {
    title: p.metaTitle,
    description,
    alternates: {
      canonical: pagePath(r.id, r.lang),
      languages: { ...Object.fromEntries(locales.map((x) => [x, pagePath(r.id, x)])), "x-default": pagePath(r.id, "fr") },
    },
    openGraph: { title: p.metaTitle, description, url: pagePath(r.id, r.lang), images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    robots: r.id === "legal" ? { index: false, follow: true } : undefined,
  };
}

function Battu({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.pages.battu;
  const photos = ["/media/hero/gateau-battu-tranche.jpg", "/media/gateau-battu/minis-battus-sortie-du-four.jpg", "/media/gateau-battu/minis-battus-sous-cloche.jpg"].map(img);
  return (
    <article>
      <header className="grid md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col justify-center px-6 py-14 md:px-12 lg:px-20">
          <p className="eyebrow">{p.eyebrow}</p>
          <h1 className="display mt-5 text-[2.8rem] md:text-[4rem]">{p.title}</h1>
          <p className="lead mt-6 max-w-lg">{p.lead}</p>
        </div>
        <div className="h-[46svh] bg-cream-deep md:h-[70svh]">
          <Image src={photos[0].src} alt={altOf(d, photos[0].src)} width={photos[0].width} height={photos[0].height} sizes="(min-width: 768px) 50vw, 100vw" quality={80} priority className="h-full w-full object-cover" />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {p.sections.map((s, i) => (
          <Reveal key={s.title} className="mb-14 last:mb-0">
            <h2 className="display text-[2rem] md:text-[2.4rem]">{s.title}</h2>
            <p className="lead mt-4">{s.text}</p>
            {i === 1 && (
              <div className="mt-10 grid grid-cols-2 gap-3">
                {photos.slice(1).map((ph) => (
                  <div key={ph.src} className="zoom aspect-[4/5] bg-cream-deep">
                    <Image src={ph.src} alt={altOf(d, ph.src)} width={ph.width} height={ph.height} sizes="(min-width: 768px) 24rem, 50vw" quality={70} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        ))}
      </div>
      <aside className="bg-butter-soft px-6 py-16 text-center md:py-20">
        <h2 className="display text-[2.2rem] md:text-[2.8rem]">{p.ctaTitle}</h2>
        <p className="lead mx-auto mt-4 max-w-xl">{p.ctaText}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <OrderLink href={`/${lang}#commander`} intent={{ product: "battu" }} className="btn">
            {d.nav.orderCta}
          </OrderLink>
          <Link href={`/${lang}#salon`} className="btn-line">
            {d.hero.ctaSalon}
          </Link>
        </div>
      </aside>
    </article>
  );
}

function Carte({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.pages.carte;
  const items = produits.items as Record<string, Item>;
  return (
    <div className="px-6 py-16 md:px-10 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">{p.eyebrow}</p>
        <h1 className="display mt-5 text-[2.8rem] md:text-[4rem]">{p.title}</h1>
        <p className="lead mt-6">{p.lead}</p>
        <div className="mt-6 text-[0.9375rem] text-muted">
          <OpenStatus />
        </div>
      </header>
      <div className="mx-auto mt-16 grid max-w-5xl gap-x-16 gap-y-14 md:grid-cols-2">
        {produits.categories.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-28">
            <h2 className="display border-b border-crust/40 pb-3 text-[1.9rem]">{d.categories[c.id as keyof Dict["categories"]]}</h2>
            <ul>
              {c.items.map((id) => {
                const it = items[id];
                const prod = d.products[id as keyof Dict["products"]];
                return (
                  <li key={id} className="flex items-baseline gap-3 border-b border-line/70 py-3">
                    <span className="flex-1">
                      <span className="block">{prod.name}</span>
                      {it.availability === "order" && <span className="text-[0.8125rem] text-sage-ink">{d.patisserie.availability.order}</span>}
                    </span>
                    <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-crust/40" />
                    <span className="shrink-0 text-end tabular-nums">
                      {it.price === null ? <span className="text-[0.875rem] text-muted">{d.patisserie.priceOnRequest}</span> : <span className="font-[family-name:var(--font-cormorant)] text-[1.2rem] font-normal">{price(it.price, lang)}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-5xl text-sm text-muted">{fill(p.checked, { date: formatDay(produits.checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}</p>
      <div className="mx-auto mt-14 flex max-w-5xl flex-wrap gap-3">
        <OrderLink href={`/${lang}#commander`} className="btn">
          {d.nav.orderCta}
        </OrderLink>
        <a href={`tel:${site.phoneIntl}`} className="btn-line">
          <PhoneIcon />
          {site.phone}
        </a>
      </div>
    </div>
  );
}

function Legal({ d }: { d: Dict }) {
  const p = d.pages.legal;
  const pending = <em className="text-muted">{p.pending}</em>;
  const blocks: [string, React.ReactNode][] = [
    [p.editor, p.editorText],
    [p.company, site.legal.company || pending],
    [p.siret, site.legal.siret || pending],
    [p.host, site.legal.host],
    [p.data, p.dataText],
    [p.cookies, p.cookiesText],
    [p.photos, p.photosText],
  ];
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="display text-[2.8rem] md:text-[3.6rem]">{p.title}</h1>
      {blocks.map(([title, body]) => (
        <section key={title} className="mt-10">
          <h2 className="eyebrow">{title}</h2>
          <p className="mt-3 leading-relaxed">{body}</p>
        </section>
      ))}
    </div>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) notFound();
  const d = getDict(r.lang);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(r.lang, r.id)) }} />
      {r.id === "battu" && <Battu lang={r.lang} d={d} />}
      {r.id === "carte" && <Carte lang={r.lang} d={d} />}
      {r.id === "legal" && <Legal d={d} />}
    </>
  );
}
