"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { CloseIcon, FacebookIcon, InstagramIcon, MenuIcon, PhoneIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { pagePath } from "@/lib/pages";

export function Header() {
  const { lang, d } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (menu) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const home = `/${lang}`;
  const order = `${home}#commander`;
  const links = [
    { href: pagePath("battu", lang), label: d.nav.battu },
    { href: `${home}#patisserie`, label: d.nav.patisserie },
    { href: `${home}#salon`, label: d.nav.salon },
    { href: order, label: d.nav.order },
    { href: `${home}#infos`, label: d.nav.infos },
  ];
  const social = (
    <>
      <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="-m-1 flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60" aria-label={d.nav.instagram}>
        <InstagramIcon />
      </a>
      <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="-m-1 flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60" aria-label={d.nav.facebook}>
        <FacebookIcon />
      </a>
    </>
  );

  return (
    <>
      <header className={`sticky top-0 z-50 border-b bg-cream/95 backdrop-blur-sm transition-colors duration-700 ${scrolled ? "border-line" : "border-transparent"}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:bg-cream focus:px-4 focus:py-2">
          {d.nav.skip}
        </a>
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:h-20 md:px-8 xl:px-10">
          <div className="flex items-center">
            <button type="button" className="-m-2 flex h-11 w-11 items-center justify-center xl:hidden" onClick={() => setMenu(true)} aria-label={d.nav.menu} aria-expanded={menu}>
              <MenuIcon />
            </button>
            <nav className="hidden items-center gap-6 xl:flex 2xl:gap-8" aria-label={d.nav.menu}>
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="nav-link whitespace-nowrap transition-opacity duration-500 hover:opacity-60">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href={home} aria-label={d.nav.home}>
            <Logo compact />
          </Link>

          <div className="flex items-center justify-end gap-3 lg:gap-5">
            <LangSwitch lang={lang} label={d.nav.lang} className="hidden lg:flex" />
            <div className="hidden items-center gap-1 lg:flex">{social}</div>
            <a href={`tel:${site.phoneIntl}`} className="-m-2 flex h-11 w-11 items-center justify-center md:hidden" aria-label={`${d.nav.call} ${site.phone}`}>
              <PhoneIcon />
            </a>
            <Link href={order} className="btn hidden !min-h-11 !px-5 whitespace-nowrap md:inline-flex">
              {d.nav.orderCta}
            </Link>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fade-in fixed inset-0 z-[60] flex flex-col overscroll-contain bg-cream text-ink" role="dialog" aria-modal="true" aria-label={d.nav.menu}>
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 md:h-20 md:px-8">
            <button type="button" className="-m-2 flex h-11 w-11 items-center justify-center justify-self-start" onClick={() => setMenu(false)} aria-label={d.nav.close}>
              <CloseIcon />
            </button>
            <Logo compact />
            <span />
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-5" aria-label={d.nav.menu}>
            {links.map((l, i) => (
              <div key={l.href} className="rise" style={{ animationDelay: `${0.05 * i}s`, animationDuration: "0.8s" }}>
                <Link href={l.href} onClick={() => setMenu(false)} className="display text-[2.2rem]">
                  {l.label}
                </Link>
              </div>
            ))}
            <Link href={order} onClick={() => setMenu(false)} className="btn mt-6">
              {d.nav.orderCta}
            </Link>
            <a href={`tel:${site.phoneIntl}`} className="link-line mt-2 text-sm">
              {site.phone}
            </a>
          </nav>
          <div className="flex items-center justify-between border-t border-line px-6 py-3">
            <LangSwitch lang={lang} label={d.nav.lang} />
            <div className="flex items-center gap-2">{social}</div>
          </div>
        </div>
      )}
    </>
  );
}

/** Barre fixée en bas de l'écran sur mobile : « Commander à retirer » toujours à portée de pouce, et l'appel. */
export function MobileOrderBar() {
  const { lang, d } = useLocale();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-px border-t border-line bg-line pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link href={`/${lang}#commander`} className="btn flex-1 !min-h-14">
        {d.nav.orderCta}
      </Link>
      <a href={`tel:${site.phoneIntl}`} className="flex min-h-14 items-center justify-center gap-2 bg-cream px-5 text-[0.75rem] tracking-[0.16em] uppercase">
        <PhoneIcon />
        {d.nav.call}
      </a>
    </div>
  );
}
