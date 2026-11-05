import Link from "next/link";
import site from "@/data/site.json";
import { BattuMark, Logo } from "@/components/Logo";
import { HoursTable } from "@/components/HoursTable";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { fill, type Dict, type Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";

export function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <footer className="border-t border-line bg-cream-deep pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:px-10 md:py-20">
        <div>
          <BattuMark className="h-12 w-auto text-crust" strokeWidth={2.6} />
          <Logo className="mt-5 !items-start" />
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-muted">{d.footer.tagline}</p>
          <div className="mt-6 flex items-center gap-2">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="-ms-2 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60" aria-label={d.nav.instagram}>
              <InstagramIcon />
            </a>
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60" aria-label={d.nav.facebook}>
              <FacebookIcon />
            </a>
          </div>
        </div>
        <div className="text-[0.9375rem] leading-relaxed">
          <p className="eyebrow mb-4">{d.infos.address}</p>
          <address className="not-italic">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </address>
          <a href={`tel:${site.phoneIntl}`} className="link-line mt-4 inline-block">
            {site.phone}
          </a>
          <ul className="mt-8 space-y-2 text-muted">
            <li>
              <Link href={pagePath("battu", lang)} className="hover:text-ink">
                {d.footer.battu}
              </Link>
            </li>
            <li>
              <Link href={pagePath("carte", lang)} className="hover:text-ink">
                {d.footer.menu}
              </Link>
            </li>
            <li>
              <Link href={pagePath("legal", lang)} className="hover:text-ink">
                {d.footer.legal}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">{d.infos.hours}</p>
          <HoursTable lang={lang} d={d} compact />
        </div>
      </div>
      <p className="border-t border-line px-6 py-6 text-center text-[0.8125rem] text-muted">{fill(d.footer.rights, { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
