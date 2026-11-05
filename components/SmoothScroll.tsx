"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.25, anchors: { offset: -72 }, autoRaf: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => lenis.destroy();
  }, []);
  return null;
}
