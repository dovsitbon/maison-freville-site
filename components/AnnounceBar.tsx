"use client";

import { useEffect, useState } from "react";
import annonces from "@/data/annonces.json";
import { CloseIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { isoDay } from "@/lib/format";

type Item = { id: string; from?: string; to?: string; fr: string; en: string };

/** Message du moment (data/annonces.json) choisi d'après la date du jour ; refermable, mémorisé pour la session. */
function current(today: string): Item {
  const items = annonces.items as Item[];
  return items.find((a) => (!a.from || a.from <= today) && (!a.to || today <= a.to)) ?? (annonces.default as Item);
}

export function AnnounceBar() {
  const { lang, d } = useLocale();
  const [item, setItem] = useState<Item>(() => current(isoDay(new Date())));
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const it = current(isoDay(new Date()));
    setItem(it);
    try {
      if (sessionStorage.getItem(`freville-bar-${it.id}`) === "1") setClosed(true);
    } catch {}
  }, []);

  if (closed) return null;
  return (
    <div className="relative z-[51] flex min-h-10 items-center justify-center bg-ink px-12 py-2 text-center text-[0.8125rem] leading-snug text-cream">
      <p suppressHydrationWarning>{item[lang]}</p>
      <button
        type="button"
        onClick={() => {
          setClosed(true);
          try {
            sessionStorage.setItem(`freville-bar-${item.id}`, "1");
          } catch {}
        }}
        className="absolute end-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
        aria-label={d.announce.close}
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
