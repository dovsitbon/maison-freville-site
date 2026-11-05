// Logo typographique de maison artisanale (aucun logo fourni : à remplacer par le vrai fichier s'il existe).
// Le dessin au trait reprend la silhouette du gâteau battu : haut, cannelé, dessus bombé qui déborde du moule.

/** Tracés du gâteau battu, dessinés de bas en haut (réutilisés par l'ouverture et le favicon). viewBox 0 0 120 160. */
export const BATTU = {
  base: "M24 150H96",
  left: "M30 150 23 74C13 68 18 34 60 30",
  right: "M90 150 97 74C107 68 102 34 60 30",
  rim: "M23 74Q60 82 97 74",
  flutes: ["M40 150 36 78", "M50 150 48.5 80", "M60 150V81", "M70 150 71.5 80", "M80 150 84 78"],
  crumb: "M38 52Q49 44 60 46",
};

export function BattuMark({ className = "h-10 w-auto", strokeWidth = 2.2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 120 160" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={BATTU.base} />
      <path d={BATTU.left} />
      <path d={BATTU.right} />
      <path d={BATTU.rim} />
      {BATTU.flutes.map((d) => (
        <path key={d} d={d} strokeWidth={strokeWidth * 0.6} />
      ))}
      <path d={BATTU.crumb} strokeWidth={strokeWidth * 0.6} />
    </svg>
  );
}

export function Logo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <span className={`flex flex-col items-center leading-none ${className}`} translate="no">
      <span className={`display ps-[0.3em] tracking-[0.3em] ${compact ? "text-[1.15rem] md:text-[1.35rem]" : "text-[1.6rem]"}`}>MAISON FRÉVILLE</span>
      <span className={`mt-1.5 font-[family-name:var(--font-cormorant)] text-crust-ink italic ${compact ? "text-[0.72rem] md:text-[0.8rem]" : "text-[0.95rem]"}`}>Les spécialités de Quesnoy-le-Montant</span>
    </span>
  );
}
