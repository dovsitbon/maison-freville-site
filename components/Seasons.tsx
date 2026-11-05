"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import saisons from "@/data/saisons.json";
import { OrderLink } from "@/components/OrderLink";
import { useLocale } from "@/components/providers";
import { altOf, fill, type Dict } from "@/lib/i18n";
import { formatDay, isoDay } from "@/lib/format";
import { img } from "@/lib/media";

type Season = { id: keyof Dict["seasons"]["items"]; from: string; to: string; image: string };

/** Saisons à venir ou en cours (data/saisons.json) : une saison passée disparaît d'elle-même, sans redéploiement. */
const upcoming = (today: string) =>
  (saisons.items as Season[])
    .filter((s) => s.to >= today)
    .sort((a, b) => a.from.localeCompare(b.from))
    .slice(0, 4);

export function Seasons({ buildDay }: { buildDay: string }) {
  const { lang, d } = useLocale();
  const [today, setToday] = useState(buildDay);
  useEffect(() => setToday(isoDay(new Date())), []);
  const list = upcoming(today);
  if (!list.length) return null;

  return (
    <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((s) => {
        const photo = img(s.image);
        const item = d.seasons.items[s.id];
        const now = s.from <= today;
        return (
          <li key={`${s.id}-${s.from}`} className="group flex flex-col">
            <div className="zoom relative aspect-[3/4] bg-cream-deep">
              <Image src={photo.src} alt={altOf(d, photo.src)} width={photo.width} height={photo.height} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw" quality={70} className="h-full w-full object-cover" />
              <p className="absolute start-0 top-0 bg-cream px-3 py-2 text-[0.75rem] tracking-[0.12em] text-crust-ink uppercase">
                {now ? `${d.seasons.now} · ${fill(d.seasons.until, { date: formatDay(s.to, lang, { day: "numeric", month: "long" }) })}` : fill(d.seasons.from, { date: formatDay(s.from, lang, { day: "numeric", month: "long" }) })}
              </p>
            </div>
            <h3 className="display mt-5 text-[1.6rem]">{item.title}</h3>
            <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
            <OrderLink href={`/${lang}#commander`} intent={{ product: s.id === "rois" ? "galette" : "other", detail: s.id === "rois" ? "" : item.title }} className="link-line mt-4 self-start text-[0.75rem] tracking-[0.16em] text-crust-ink uppercase" label={`${d.seasons.order} : ${item.title}`}>
              {d.seasons.order}
            </OrderLink>
          </li>
        );
      })}
    </ul>
  );
}
