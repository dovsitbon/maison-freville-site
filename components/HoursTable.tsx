import { formatTime } from "@/lib/format";
import { weekHours } from "@/lib/hours";
import type { Dict, Locale } from "@/lib/i18n";

/** Horaires de la semaine (data/horaires.json), du mardi au lundi : la semaine de la boutique commence le mardi. */
export function HoursTable({ lang, d, compact = false }: { lang: Locale; d: Dict; compact?: boolean }) {
  const week = weekHours();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <table className={`w-full ${compact ? "text-[0.9375rem]" : "text-base"}`}>
      <tbody>
        {order.map((i) => (
          <tr key={i} className="border-b border-line/70 last:border-0">
            <th scope="row" className="py-2 pe-4 text-start font-normal">
              {d.infos.days[i]}
            </th>
            <td className={`py-2 text-end ${week[i].length ? "" : "text-muted"}`}>{week[i].length ? week[i].map(([a, b]) => `${formatTime(a, lang)} – ${formatTime(b, lang)}`).join(", ") : d.infos.closed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
