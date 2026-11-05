"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox, type LightboxItem, type LightboxLabels } from "@/components/Lightbox";

/** Grille de ses photos Instagram, ouvertes en grand au clic. */
export function Gallery({ items, labels, openLabel }: { items: LightboxItem[]; labels: LightboxLabels; openLabel: string }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        {items.map((it, i) => (
          <li key={it.src}>
            <button type="button" onClick={() => setIndex(i)} className="zoom block aspect-square w-full cursor-zoom-in bg-cream-deep" aria-label={`${openLabel} : ${it.alt}`}>
              <Image src={it.src} alt={it.alt} width={it.width} height={it.height} sizes="(min-width: 768px) 24vw, 48vw" quality={70} className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={index} onIndex={setIndex} labels={labels} />
    </>
  );
}
