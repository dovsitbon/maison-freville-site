import hours from "@/data/horaires.json";
import { isoDay } from "@/lib/format";

export type Slot = [string, string];
type Week = Record<string, Slot[]>;
type Exception = { date: string; closed?: boolean; slots?: Slot[] };

const week = hours.week as unknown as Week;
const exceptions = hours.exceptions as Exception[];

/** Jour ISO (1 = lundi … 7 = dimanche) d'une date AAAA-MM-JJ. */
export const weekday = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1;
};

export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

/** Créneaux d'ouverture d'un jour donné (fermetures exceptionnelles comprises). */
export function slotsOn(iso: string): Slot[] {
  const ex = exceptions.find((e) => e.date === iso);
  if (ex) return ex.closed ? [] : (ex.slots ?? []);
  return week[String(weekday(iso))] ?? [];
}

export const isOpenDay = (iso: string) => slotsOn(iso).length > 0;

/** Heure de Paris « HH:MM ». */
const parisTime = (date: Date) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);

export type Status = { open: true; until: string } | { open: false; nextDay: string | null; at: string | null };

/** Ouvert / fermé en ce moment, et prochaine ouverture. */
export function statusAt(date: Date): Status {
  const today = isoDay(date);
  const now = parisTime(date);
  for (const [a, b] of slotsOn(today)) if (now >= a && now < b) return { open: true, until: b };
  const later = slotsOn(today).find(([a]) => a > now);
  if (later) return { open: false, nextDay: today, at: later[0] };
  for (let i = 1; i <= 14; i++) {
    const day = addDays(today, i);
    const s = slotsOn(day);
    if (s.length) return { open: false, nextDay: day, at: s[0][0] };
  }
  return { open: false, nextDay: null, at: null };
}

/** Horaires de la semaine, du lundi au dimanche, pour l'affichage et le schema.org. */
export const weekHours = () => [1, 2, 3, 4, 5, 6, 7].map((n) => week[String(n)] ?? []);
