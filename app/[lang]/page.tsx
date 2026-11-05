import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import produits from "@/data/produits.json";
import { getDict, altOf, fill, isLocale, type Dict, type Locale } from "@/lib/i18n";
import { formatDay, isoDay } from "@/lib/format";
import { img } from "@/lib/media";
import { pagePath } from "@/lib/pages";
import { homeJsonLd } from "@/lib/jsonld";
import { Reveal } from "@/components/Reveal";
import { OpenStatus } from "@/components/OpenStatus";
import { OrderLink } from "@/components/OrderLink";
import { ProductCard, type ProductId } from "@/components/ProductCard";
import { MinisComposer } from "@/components/MinisComposer";
import { Seasons } from "@/components/Seasons";
import { Gallery } from "@/components/Gallery";
import { OrderForm } from "@/components/OrderForm";
import { HoursTable } from "@/components/HoursTable";
import { BagIcon, CakeIcon, CupIcon, PhoneIcon, PinIcon, PlusIcon, StarIcon } from "@/components/icons";
import sizes from "@/data/media-sizes.json";

// Les saisons et le bandeau se recalculent aussi côté navigateur ; la page est régénérée chaque jour.
export const revalidate = 86400;

const GALLERY = [
  "/media/patisseries/eclair-chocolat-noisettes.jpg",
  "/media/patisseries/tartelette-citron-dessus.jpg",
  "/media/patisseries/chou-fraises-amandes.jpg",
  "/media/patisseries/tarte-fraises.jpg",
  "/media/patisseries/tartelettes-fraises-vanille.jpg",
  "/media/patisseries/dome-coco.jpg",
  "/media/saisons/paques-mouton-chocolat.jpg",
  "/media/patisseries/entremets-fraises.jpg",
];

// Emplacement prévu pour la photo de la salle (à prendre sur place) : s'affiche dès que le fichier existe
const INTERIOR = "/media/salon-de-the/interieur-salon.jpg";

function Rating({ lang, d, className = "" }: { lang: Locale; d: Dict; className?: string }) {
  const value = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: 1 }).format(site.rating.value);
  return (
    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 hover:text-ink ${className}`} title={fill(d.hero.ratingNote, { date: formatDay(site.rating.checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}>
      <span className="flex text-crust" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </span>
      <span>
        {fill(d.hero.rating, { value })} · {fill(d.hero.ratingCount, { count: site.rating.count })}
      </span>
    </a>
  );
}

function SectionHead({ eyebrow, title, intro, center = false }: { eyebrow: string; title: string; intro?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display mt-4 text-[2.4rem] md:text-[3.4rem]">{title}</h2>
      {intro && <p className="lead mt-5">{intro}</p>}
    </Reveal>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = getDict(lang);
  const order = `/${lang}#commander`;
  const hero = img("/media/hero/gateau-battu-tranche.jpg");

  const tiles = [
    { key: "battu", href: pagePath("battu", lang), src: "/media/gateau-battu/minis-battus-sortie-du-four.jpg" },
    { key: "minis", href: `/${lang}#minis`, src: "/media/patisseries/plateau-minis-choux.jpg" },
    { key: "patisseries", href: `/${lang}#patisserie`, src: "/media/patisseries/eclairs-chocolat.jpg" },
    { key: "sale", href: `${pagePath("carte", lang)}#sale`, src: "/media/sale/tourte-maison.jpg" },
    { key: "guimauves", href: `${pagePath("carte", lang)}#douceurs`, src: "/media/patisseries/coffret-chocolats-maison.jpg" },
    { key: "saisons", href: `/${lang}#saisons`, src: "/media/saisons/paques-oeufs-ajoures.jpg" },
  ] as const;

  const services = [
    { key: "pickup", Icon: BagIcon, href: order },
    { key: "salon", Icon: CupIcon, href: `/${lang}#salon` },
    { key: "events", Icon: CakeIcon, href: order },
    { key: "phone", Icon: PhoneIcon, href: `tel:${site.phoneIntl}` },
  ] as const;

  const team = img("/media/salon-de-the/equipe-devant-la-boutique.jpg");
  const cloches = img("/media/gateau-battu/battu-garni-creme-abricot.jpg");
  const chevalet = img("/media/salon-de-the/chevalet-salon-de-the.jpg");
  const facade = img("/media/salon-de-the/facade-enseigne.jpg");
  const interior = INTERIOR in sizes ? img(INTERIOR) : null;
  const gallery = GALLERY.map((src) => ({ ...img(src), alt: altOf(d, src) }));
  const salon = produits.salon as Record<"teas" | "coffees" | "formulas", { name_fr: string; name_en: string; price: number | null }[]>;
  const salonMenu = (["teas", "coffees", "formulas"] as const).filter((k) => salon[k].length);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(lang)) }} />

      {/* 1. Hero : une seule création, deux boutons, la note Google et le statut juste dessous */}
      <section className="grid md:min-h-[calc(100svh-7.5rem)] md:grid-cols-[1fr_1.05fr]">
        <div className="relative order-1 h-[40svh] overflow-hidden bg-cream-deep md:order-2 md:h-auto">
          <Image src={hero.src} alt={altOf(d, hero.src)} width={hero.width} height={hero.height} sizes="(min-width: 768px) 52vw, 100vw" quality={80} priority fetchPriority="high" className="drift h-full w-full object-cover object-[50%_60%]" />
        </div>
        <div className="order-2 flex flex-col justify-center px-6 pt-9 pb-12 md:order-1 md:px-12 md:py-16 lg:px-20">
          <p className="eyebrow rise">{d.hero.eyebrow}</p>
          <h1 className="display rise mt-5 text-[2.7rem] md:text-[3.6rem] lg:text-[4.4rem]" style={{ animationDelay: "0.1s" }}>
            {d.hero.title}
          </h1>
          <p className="lead rise mt-6 max-w-lg" style={{ animationDelay: "0.2s" }}>
            {d.hero.sub}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
            <OrderLink href={order} className="btn">
              {d.hero.ctaOrder}
            </OrderLink>
            <Link href={`/${lang}#salon`} className="btn-line">
              {d.hero.ctaSalon}
            </Link>
          </div>
          <div className="rise mt-8 flex flex-col gap-2 text-[0.9375rem] text-muted sm:flex-row sm:flex-wrap sm:gap-x-6" style={{ animationDelay: "0.4s" }}>
            <Rating lang={lang} d={d} />
            <OpenStatus />
          </div>
        </div>
      </section>

      {/* 2. Tuiles de catégories, en capitales sur photo */}
      <section aria-label={d.tiles.title} className="px-4 pt-16 md:px-10 md:pt-24">
        <h2 className="sr-only">{d.tiles.title}</h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
          {tiles.map((t, i) => {
            const p = img(t.src);
            return (
              <Reveal as="li" key={t.key} delay={(i % 3) * 0.08}>
                <Link href={t.href} className="group zoom relative block aspect-[4/5] bg-cream-deep md:aspect-[5/4]">
                  <Image src={p.src} alt="" width={p.width} height={p.height} sizes="(min-width: 768px) 32vw, 50vw" quality={70} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-cream/95 px-3 py-3 text-center text-[0.6875rem] tracking-[0.2em] uppercase md:py-4 md:text-[0.8125rem] md:tracking-[0.26em]">{d.tiles.items[t.key]}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* 3. Bande de services en 4 pictos */}
      <section aria-label={d.services.title} className="px-6 py-16 md:px-10 md:py-20">
        <h2 className="sr-only">{d.services.title}</h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 border-y border-line py-10 lg:grid-cols-4">
          {services.map(({ key, Icon, href }) => (
            <li key={key}>
              <a href={href} className="group flex flex-col items-center text-center">
                <Icon className="h-8 w-8 text-crust" />
                <span className="mt-4 text-[0.75rem] tracking-[0.16em] uppercase group-hover:text-crust-ink">{d.services.items[key].title}</span>
                <span className="mt-2 max-w-[16rem] text-[0.875rem] leading-relaxed text-muted">{d.services.items[key].text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. L'histoire du gâteau battu */}
      <section id="histoire" className="bg-butter-soft px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal className="zoom aspect-[4/5] bg-cream-deep">
            <Image src={team.src} alt={altOf(d, team.src)} width={team.width} height={team.height} sizes="(min-width: 768px) 46vw, 100vw" quality={70} className="h-full w-full object-cover" />
          </Reveal>
          <div>
            <SectionHead eyebrow={d.story.eyebrow} title={d.story.title} />
            <Reveal delay={0.1}>
              <p className="lead mt-6">{d.story.p1}</p>
              <p className="lead mt-4">{d.story.p2}</p>
              <p className="lead mt-4">{d.story.p3}</p>
              <ul className="mt-8 grid gap-3 border-t border-crust/30 pt-6 text-[0.9375rem] sm:grid-cols-3 sm:gap-6">
                {Object.values(d.story.facts).map((f) => (
                  <li key={f} className="border-s border-crust/50 ps-3">
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={pagePath("battu", lang)} className="btn-line mt-10">
                {d.story.cta}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. La pâtisserie : cartes produits */}
      <section id="patisserie" className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead eyebrow={d.patisserie.eyebrow} title={d.patisserie.title} intro={d.patisserie.intro} />
            <Link href={pagePath("carte", lang)} className="link-line shrink-0 self-start text-[0.75rem] tracking-[0.16em] uppercase md:self-auto">
              {d.patisserie.seeMenu}
            </Link>
          </div>
          <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {(produits.home as ProductId[]).map((id, i) => (
              <Reveal as="li" key={id} delay={(i % 4) * 0.06}>
                <ProductCard id={id} lang={lang} d={d} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Plateau de minis à composer */}
      <section id="minis" className="bg-cream-deep px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHead eyebrow={d.minis.eyebrow} title={d.minis.title} intro={d.minis.intro} />
            <Reveal delay={0.1} className="zoom mt-10 hidden aspect-[3/2] bg-cream lg:block">
              <Image src={cloches.src} alt={altOf(d, cloches.src)} width={cloches.width} height={cloches.height} sizes="45vw" quality={70} className="h-full w-full object-cover" />
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <MinisComposer />
          </Reveal>
        </div>
      </section>

      {/* 7. Le salon de thé */}
      <section id="salon" className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <div className="md:order-2">
            <Reveal className="zoom aspect-[3/4] bg-cream-deep">
              <Image src={(interior ?? chevalet).src} alt={altOf(d, (interior ?? chevalet).src)} width={(interior ?? chevalet).width} height={(interior ?? chevalet).height} sizes="(min-width: 768px) 46vw, 100vw" quality={70} className="h-full w-full object-cover" />
            </Reveal>
          </div>
          <div className="md:order-1">
            <SectionHead eyebrow={d.salon.eyebrow} title={d.salon.title} />
            <Reveal delay={0.1}>
              <p className="lead mt-6">{d.salon.p1}</p>
              <p className="lead mt-4">{d.salon.p2}</p>
              <div className="mt-10 border-t border-line pt-6">
                <h3 className="display text-[1.6rem]">{d.salon.menuTitle}</h3>
                {salonMenu.length ? (
                  salonMenu.map((k) => (
                    <div key={k} className="mt-5">
                      <p className="eyebrow">{d.salon[k]}</p>
                      <ul className="mt-2">
                        {salon[k].map((it) => (
                          <li key={it.name_fr} className="flex justify-between border-b border-line/70 py-2">
                            <span>{lang === "fr" ? it.name_fr : it.name_en}</span>
                            {it.price !== null && <span>{new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR" }).format(it.price)}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{d.salon.menuSoon}</p>
                )}
              </div>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line mt-10">
                <PinIcon />
                {d.salon.cta}
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. Créations de saison */}
      <section id="saisons" className="border-t border-line px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow={d.seasons.eyebrow} title={d.seasons.title} intro={d.seasons.intro} />
          <div className="mt-14">
            <Seasons buildDay={isoDay(new Date())} />
          </div>
        </div>
      </section>

      {/* 9. Commande à retirer */}
      <section id="commander" className="scroll-mt-20 bg-butter-soft px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead eyebrow={d.order.eyebrow} title={d.order.title} intro={d.order.intro} />
            <Reveal delay={0.1} className="mt-10 border-t border-crust/30 pt-8">
              <p className="display text-[1.5rem]">{d.order.callTitle}</p>
              <p className="mt-2 text-[0.9375rem] text-muted">{d.order.callText}</p>
              <a href={`tel:${site.phoneIntl}`} className="btn-line mt-5">
                <PhoneIcon />
                {d.nav.call} · {site.phone}
              </a>
              <div className="mt-6 text-[0.9375rem] text-muted">
                <OpenStatus />
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.05}>
            <OrderForm />
          </Reveal>
        </div>
      </section>

      {/* 10. Galerie Instagram */}
      <section id="galerie" className="px-4 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 px-2 md:flex-row md:items-end md:px-0">
            <SectionHead eyebrow={d.gallery.eyebrow} title={d.gallery.title} />
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn-line self-start md:self-auto">
              {d.gallery.follow}
            </a>
          </div>
          <div className="mt-12">
            <Gallery items={gallery} labels={{ close: d.gallery.close, prev: d.gallery.prev, next: d.gallery.next, counter: d.gallery.counter }} openLabel={d.gallery.open} />
          </div>
          <p className="mt-6 text-center text-sm text-muted">{site.instagramHandle}</p>
        </div>
      </section>

      {/* 11. Infos pratiques */}
      <section id="infos" className="bg-cream-deep px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow={d.infos.eyebrow} title={d.infos.title} />
          <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1fr_1.2fr]">
            <Reveal className="zoom hidden aspect-[3/4] bg-cream lg:block">
              <Image src={facade.src} alt={altOf(d, facade.src)} width={facade.width} height={facade.height} sizes="28vw" quality={70} className="h-full w-full object-cover" />
            </Reveal>
            <Reveal delay={0.05} className="space-y-8 text-[0.9375rem] leading-relaxed">
              <div>
                <p className="eyebrow mb-3">{d.infos.address}</p>
                <address className="text-lg not-italic">
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </address>
              </div>
              <div>
                <p className="eyebrow mb-3">{d.infos.access}</p>
                <p className="text-muted">{d.infos.accessText}</p>
              </div>
              <div>
                <p className="eyebrow mb-3">{d.infos.phone}</p>
                <a href={`tel:${site.phoneIntl}`} className="link-line text-lg">
                  {site.phone}
                </a>
              </div>
              <div>
                <p className="eyebrow mb-3">{d.infos.hours}</p>
                <HoursTable lang={lang} d={d} />
                <div className="mt-3 text-muted">
                  <OpenStatus />
                </div>
              </div>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
                <PinIcon />
                {d.infos.route}
              </a>
            </Reveal>
            <Reveal delay={0.1} className="min-h-80 bg-cream lg:min-h-full">
              <iframe title={d.infos.mapTitle} src={site.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-80 w-full border-0 grayscale-[35%] sepia-[15%]" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section id="faq" className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHead eyebrow={d.faq.eyebrow} title={d.faq.title} />
          <Reveal delay={0.05}>
            <div className="divide-y divide-line border-y border-line">
              {d.faq.items.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-[1.0625rem]">
                    {f.q}
                    <PlusIcon className="faq-plus h-4 w-4 shrink-0 text-crust-ink" />
                  </summary>
                  <p className="pb-6 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
