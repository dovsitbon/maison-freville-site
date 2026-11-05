"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BATTU } from "@/components/Logo";

const KEY = "freville-intro";
const at = (d: number, t?: number) => ({ "--d": `${d}s`, ...(t ? { "--t": `${t}s` } : {}) }) as CSSProperties;

/**
 * Ouverture (≤ 2 s, une fois par session), tout en CSS (globals.css) :
 * fond crème, le gâteau battu se dessine au trait doré de bas en haut avec ses cannelures,
 * une fine vapeur monte de la tasse de thé, « MAISON FRÉVILLE » puis le sous-titre, fondu sur le hero.
 */
export function Intro({ skipLabel }: { skipLabel: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      document.documentElement.classList.add("intro-seen");
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  const p = { pathLength: 1, className: "intro-draw" };
  return (
    <div className="intro-curtain flex flex-col items-center justify-center text-ink">
      <svg viewBox="0 0 220 160" className="h-36 w-auto md:h-44" fill="none" stroke="#9a6a36" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path {...p} d={BATTU.base} style={at(0, 0.25)} />
        <path {...p} d={BATTU.left} style={at(0.12, 0.7)} />
        <path {...p} d={BATTU.right} style={at(0.12, 0.7)} />
        {BATTU.flutes.map((d, i) => (
          <path key={d} {...p} d={d} strokeWidth={1} style={at(0.2 + i * 0.04, 0.5)} />
        ))}
        <path {...p} d={BATTU.rim} style={at(0.62, 0.3)} />
        <path {...p} d={BATTU.crumb} strokeWidth={1} style={at(0.78, 0.25)} />
        {/* Tasse de thé et sa vapeur */}
        <path {...p} d="M134 152H198" style={at(0.3, 0.3)} />
        <path {...p} d="M142 124C142 142 151 149 164 149S186 142 186 124Z" style={at(0.35, 0.45)} />
        <path {...p} d="M186 129C196 129 196 141 184 142" strokeWidth={1.2} style={at(0.6, 0.25)} />
        <path pathLength={1} className="intro-steam" d="M157 116C152 106 162 100 157 88" strokeWidth={1} style={at(0.7)} />
        <path pathLength={1} className="intro-steam" d="M170 116C165 104 176 98 170 84" strokeWidth={1} style={at(0.85)} />
      </svg>
      <p className="intro-name display mt-8 ps-[0.3em] text-center text-[clamp(1.7rem,6vw,2.6rem)]" translate="no" aria-hidden="true">
        MAISON FRÉVILLE
      </p>
      <p className="intro-fade mt-3 font-[family-name:var(--font-cormorant)] text-lg text-crust-ink italic md:text-xl" style={at(1.1)} translate="no" aria-hidden="true">
        Les spécialités de Quesnoy-le-Montant
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
          document.documentElement.classList.add("intro-seen");
          setGone(true);
        }}
        className="nav-link absolute end-4 bottom-4 min-h-11 px-4 text-muted transition-colors hover:text-ink"
      >
        {skipLabel}
      </button>
    </div>
  );
}
