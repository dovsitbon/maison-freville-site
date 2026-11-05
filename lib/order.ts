import site from "@/data/site.json";
import produits from "@/data/produits.json";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { formatDay, isoDay } from "@/lib/format";
import { addDays, isOpenDay } from "@/lib/hours";

export const PRODUCTS = ["battu", "plateau", "galette", "other"] as const;
export const SIZES = ["small", "medium", "large"] as const;
export const KINDS = ["sweet", "savory", "mixed"] as const;
export const SLOTS = ["morning", "midday", "afternoon"] as const;
export const PORTIONS = produits.galettePortions as number[];

export type ProductKind = (typeof PRODUCTS)[number];
export type Size = (typeof SIZES)[number];
export type PlateKind = (typeof KINDS)[number];
export type SlotId = (typeof SLOTS)[number];

export type OrderLine = { product: ProductKind; size: Size | ""; kind: PlateKind | ""; portions: number; detail: string; qty: number };
export type Order = { lines: OrderLine[]; date: string; slot: SlotId | ""; name: string; phone: string; email: string; message: string };

export const emptyLine = (product: ProductKind = "battu", detail = ""): OrderLine => ({
  product,
  size: product === "battu" ? "medium" : "",
  kind: product === "plateau" ? "mixed" : "",
  portions: product === "galette" ? 6 : 0,
  detail,
  qty: 1,
});

export const isPhone = (v: string) => /^[+\d][\d\s\-().]{7,19}$/.test(v.trim());
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Premier jour de retrait possible : délai de commande (data/site.json → order.leadHours), puis premier jour ouvert. */
export function earliestPickup(now: Date) {
  let day = isoDay(new Date(now.getTime() + site.order.leadHours * 3600_000));
  for (let i = 0; i < 21 && !isOpenDay(day); i++) day = addDays(day, 1);
  return day;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = <T extends string>(v: unknown, list: readonly T[]): T | "" => (list.includes(v as T) ? (v as T) : "");

/** Nettoie une commande reçue côté serveur : null si elle est incomplète. */
export function parseOrder(v: unknown): Order | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const lines = (Array.isArray(o.lines) ? o.lines : []).slice(0, 12).flatMap((l): OrderLine[] => {
    if (!l || typeof l !== "object") return [];
    const x = l as Record<string, unknown>;
    const product = pick(x.product, PRODUCTS);
    if (!product) return [];
    const qty = Math.min(Math.max(Math.round(Number(x.qty) || 1), 1), site.order.maxPerLine);
    const portions = PORTIONS.includes(Number(x.portions)) ? Number(x.portions) : 0;
    return [{ product, size: pick(x.size, SIZES), kind: pick(x.kind, KINDS), portions, detail: str(x.detail, 400), qty }];
  });
  const q: Order = {
    lines,
    date: ISO.test(str(o.date, 10)) ? str(o.date, 10) : "",
    slot: pick(o.slot, SLOTS),
    name: str(o.name, 120),
    phone: str(o.phone, 30),
    email: str(o.email, 160),
    message: str(o.message, 1500),
  };
  if (!q.lines.length || !q.date || !isOpenDay(q.date) || !q.slot || !q.name || !isPhone(q.phone)) return null;
  if (q.email && !isEmail(q.email)) q.email = "";
  return q;
}

/** Une ligne de commande en clair : « 2 × Gâteau battu (Moyen) ». */
export function lineLabel(l: OrderLine, d: Dict) {
  const o = d.order;
  const extra = [
    l.product === "battu" && l.size ? o.sizes[l.size] : "",
    l.product === "plateau" && l.kind ? o.kinds[l.kind] : "",
    l.product === "galette" && l.portions ? o.portionsValue.replace("{n}", String(l.portions)) : "",
  ]
    .filter(Boolean)
    .join(", ");
  const base = `${l.qty} × ${o.products[l.product]}${extra ? ` (${extra})` : ""}`;
  return l.detail ? `${base} : ${l.detail}` : base;
}

/** Récapitulatif texte de la commande (e-mail, WhatsApp). */
export function orderText(q: Order, lang: Locale, d: Dict, withContact = true) {
  const m = d.order.mail;
  const c = lang === "fr" ? " :" : ":";
  const pickup = `${formatDay(q.date, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${q.slot ? d.order.slots[q.slot] : ""}`;
  const blocks = [
    [`${m.lines}${c}`, ...q.lines.map((l) => `– ${lineLabel(l, d)}`)].join("\n"),
    `${m.pickup}${c} ${pickup}`,
    withContact ? [`${m.name}${c} ${q.name}`, `${m.phone}${c} ${q.phone}`, q.email ? `${m.email}${c} ${q.email}` : ""].filter(Boolean).join("\n") : "",
    q.message ? `${m.message}${c}\n${q.message}` : "",
  ];
  return blocks.filter(Boolean).join("\n\n");
}

/** Lien WhatsApp (vide tant que la boutique n'a pas donné de portable : data/site.json → whatsapp). */
export const waLink = (text: string) => (site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : "");
