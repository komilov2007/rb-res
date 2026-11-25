"use client";

import { useEffect, useRef } from "react";

// Bottom drawer ochilganda klaviatura darhol chiqib, drawer animatsiyasi bilan
// to'qnashib "sakrash" bo'lmasligi uchun — input fokusi kechiktiriladi.
export const useDelayedFocus = <T extends HTMLElement = HTMLDivElement>(
  enabled: boolean,
  delay = 500,
) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      containerRef.current
        ?.querySelector<HTMLInputElement>("input")
        ?.focus({ preventScroll: true });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [enabled, delay]);

  return containerRef;
};
