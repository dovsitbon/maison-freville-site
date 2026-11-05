"use client";

import { useState } from "react";
import produits from "@/data/produits.json";
import { goToOrder } from "@/components/OrderLink";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill, type Dict } from "@/lib/i18n";

type Mini = { id: keyof Dict["products"]; kind: "sweet" | "savory" };
const MINIS = produits.minis.items as Mini[];
const SIZE = produits.minis.size;

/** Plateau à composer : 15 minis sucrés ou salés, puis la composition part dans le formulaire de commande. */
export function MinisComposer() {
  const { d } = useLocale();
  const t = d.minis;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const left = SIZE - total;

  const set = (id: string, delta: number) =>
    setCounts((c) => {
      const n = Math.max(0, (c[id] ?? 0) + delta);
      if (delta > 0 && Object.values(c).reduce((a, b) => a + b, 0) >= SIZE) return c;
      return { ...c, [id]: n };
    });

  const kinds = new Set(MINIS.filter((m) => counts[m.id]).map((m) => m.kind));
  const plateKind: "sweet" | "savory" | "mixed" = kinds.size === 2 ? "mixed" : kinds.has("savory") ? "savory" : "sweet";
  const summary = MINIS.filter((m) => counts[m.id])
    .map((m) => `${counts[m.id]} ${d.products[m.id].name}`)
    .join(", ");

  return (
    <div className="border border-line bg-cream p-5 md:p-8">
      {(["sweet", "savory"] as const).map((kind) => (
        <fieldset key={kind} className="mb-6 last:mb-0">
          <legend className="eyebrow mb-3">{t[kind]}</legend>
          <ul className="divide-y divide-line border-y border-line">
            {MINIS.filter((m) => m.kind === kind).map((m) => {
              const name = d.products[m.id].name;
              const n = counts[m.id] ?? 0;
              return (
                <li key={m.id} className="flex min-h-14 items-center justify-between gap-4 py-1.5">
                  <span className="text-[0.9875rem]">{name}</span>
                  <span className="flex items-center gap-1">
                    <button type="button" onClick={() => set(m.id, -1)} disabled={!n} className="flex h-11 w-11 items-center justify-center border border-transparent transition-colors hover:border-line disabled:opacity-30" aria-label={fill(t.remove, { name })}>
                      <MinusIcon />
                    </button>
                    <output className="w-6 text-center font-[family-name:var(--font-cormorant)] text-xl tabular-nums" aria-live="polite">
                      {n}
                    </output>
                    <button type="button" onClick={() => set(m.id, 1)} disabled={left <= 0} className="flex h-11 w-11 items-center justify-center border border-transparent transition-colors hover:border-line disabled:opacity-30" aria-label={fill(t.add, { name })}>
                      <PlusIcon />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <div className="mt-6">
        <div className="h-1 w-full bg-cream-deep" aria-hidden="true">
          <div className="h-full bg-crust transition-[width] duration-500" style={{ width: `${(total / SIZE) * 100}%` }} />
        </div>
        <p className="mt-3 flex justify-between text-sm text-muted" aria-live="polite">
          <span>{fill(t.count, { n: total, total: SIZE })}</span>
          <span>{left > 0 ? fill(t.left, { n: left }) : t.full}</span>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" className="btn" disabled={total === 0} onClick={() => goToOrder({ product: "plateau", detail: summary, kind: plateKind })} aria-disabled={total === 0}>
          {t.submit}
        </button>
        {total > 0 && (
          <button type="button" onClick={() => setCounts({})} className="link-line text-sm text-muted">
            {t.reset}
          </button>
        )}
      </div>
      <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">{t.hint}</p>
    </div>
  );
}
