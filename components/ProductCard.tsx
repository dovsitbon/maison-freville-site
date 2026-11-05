import Image from "next/image";
import produits from "@/data/produits.json";
import { OrderLink } from "@/components/OrderLink";
import { altOf, type Dict, type Locale } from "@/lib/i18n";
import { price } from "@/lib/format";
import { img } from "@/lib/media";
import type { ProductKind } from "@/lib/order";

type Item = { price: number | null; from?: boolean; availability: "shop" | "order" | "both"; image?: string; orderAs?: ProductKind };
export type ProductId = keyof Dict["products"];

/** Carte produit façon grande maison : photo, nom, prix « à partir de », disponibilité, « Je commande ». */
export function ProductCard({ id, lang, d, priority = false }: { id: ProductId; lang: Locale; d: Dict; priority?: boolean }) {
  const item = (produits.items as Record<string, Item>)[id];
  const p = d.products[id];
  const photo = item.image ? img(item.image) : null;
  const orderable = item.availability !== "shop" || item.orderAs;
  return (
    <article className="group flex flex-col">
      <div className="zoom aspect-[4/5] bg-cream-deep">
        {photo && <Image src={photo.src} alt={altOf(d, photo.src)} width={photo.width} height={photo.height} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw" quality={70} priority={priority} className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[0.75rem] tracking-[0.12em] text-sage-ink uppercase">{d.patisserie.availability[item.availability]}</p>
        <h3 className="display mt-2 text-[1.6rem]">{p.name}</h3>
        {p.desc && <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{p.desc}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <p className="text-[0.9375rem]">
            {item.price === null ? (
              <span className="text-muted">{d.patisserie.priceOnRequest}</span>
            ) : (
              <>
                {item.from && <span className="text-muted">{d.patisserie.from} </span>}
                <span className="font-[family-name:var(--font-cormorant)] text-[1.35rem] font-normal">{price(item.price, lang)}</span>
              </>
            )}
          </p>
          {orderable && (
            <OrderLink href={`/${lang}#commander`} intent={{ product: item.orderAs ?? "other", detail: item.orderAs === "other" || item.orderAs === "plateau" ? p.name : undefined }} className="link-line shrink-0 text-[0.75rem] tracking-[0.16em] text-crust-ink uppercase" label={`${d.patisserie.order} : ${p.name}`}>
              {d.patisserie.order}
            </OrderLink>
          )}
        </div>
      </div>
    </article>
  );
}
