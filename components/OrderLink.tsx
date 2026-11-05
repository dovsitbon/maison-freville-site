"use client";

import type { ReactNode } from "react";
import type { PlateKind, ProductKind } from "@/lib/order";

export const ORDER_EVENT = "freville:order";
export type OrderIntent = { product: ProductKind; detail?: string; kind?: PlateKind };

/** Préremplit le formulaire de commande puis y descend. Sans JavaScript, le lien suffit (#commander). */
export function goToOrder(intent?: OrderIntent) {
  if (intent) window.dispatchEvent(new CustomEvent<OrderIntent>(ORDER_EVENT, { detail: intent }));
  const el = document.getElementById("commander");
  if (!el) {
    // Autre page : le formulaire de l'accueil reprendra la demande à son chargement
    try {
      if (intent) sessionStorage.setItem(ORDER_EVENT, JSON.stringify(intent));
    } catch {}
    return false;
  }
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", "#commander");
  return true;
}

export function OrderLink({ href, intent, className = "", children, label }: { href: string; intent?: OrderIntent; className?: string; children: ReactNode; label?: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (goToOrder(intent)) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
