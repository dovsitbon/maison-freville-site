"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ArrowIcon, CloseIcon } from "@/components/icons";
import type { Img } from "@/lib/media";

export type LightboxItem = Img & { alt: string };
export type LightboxLabels = { close: string; prev: string; next: string; counter: string };

/** Visionneuse plein écran : clavier (Échap, flèches dans le sens de lecture), focus rendu à la fermeture. */
export function Lightbox({ items, index, onIndex, labels, title }: { items: LightboxItem[]; index: number | null; onIndex: (i: number | null) => void; labels: LightboxLabels; title?: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const current = index === null ? null : items[index];

  const close = useCallback(() => {
    onIndex(null);
    lastFocus.current?.focus();
  }, [onIndex]);
  const step = useCallback((dir: 1 | -1) => index !== null && onIndex((index + dir + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    if (index === null) return;
    if (!lastFocus.current || !document.contains(lastFocus.current)) lastFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-lightbox] button")];
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length];
        if (next) {
          e.preventDefault();
          next.focus();
        }
      }
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  // Mémorise l'élément qui a ouvert la visionneuse, avant que le focus n'y entre
  useEffect(() => {
    if (index === null) lastFocus.current = null;
  }, [index]);

  return (
    <>
      {current && index !== null && (
        <div
          className="fade-in fixed inset-0 z-[70] flex items-center justify-center overscroll-contain bg-ink/95 p-4 md:p-12"
          role="dialog"
          aria-modal="true"
          data-lightbox=""
          aria-label={title ?? current.alt}
          onClick={close}
        >
          <figure key={current.src} className="fade-in relative" onClick={(e) => e.stopPropagation()}>
            <Image src={current.src} alt={current.alt} width={current.width} height={current.height} sizes="90vw" quality={80} className="h-auto max-h-[78svh] w-auto max-w-[88vw]" />
            <figcaption className="mx-auto mt-4 flex max-w-[88vw] flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-center text-sm text-cream/80">
              {title && <span className="eyebrow !text-butter">{title}</span>}
              <span>{current.alt}</span>
              {items.length > 1 && (
                <span className="num text-xs text-cream/60">
                  {labels.counter.replace("{n}", String(index + 1)).replace("{total}", String(items.length))}
                </span>
              )}
            </figcaption>
          </figure>
          <button ref={closeRef} type="button" onClick={close} className="absolute end-3 top-3 flex h-12 w-12 items-center justify-center text-cream" aria-label={labels.close}>
            <CloseIcon className="h-6 w-6" />
          </button>
          {items.length > 1 && (
            <>
              <button type="button" onClick={(e) => (e.stopPropagation(), step(-1))} className="absolute start-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-cream md:start-5" aria-label={labels.prev}>
                <ArrowIcon className="h-6 w-6 -scale-x-100 rtl:scale-x-100" />
              </button>
              <button type="button" onClick={(e) => (e.stopPropagation(), step(1))} className="absolute end-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-cream md:end-5" aria-label={labels.next}>
                <ArrowIcon className="h-6 w-6 rtl:-scale-x-100" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
