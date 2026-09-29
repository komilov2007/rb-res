"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

// Drives every scroll-linked effect of AtmosphereFour by writing styles
// straight to the DOM inside requestAnimationFrame — no React state, so
// nothing re-renders while scrolling:
//   hero  — video zooms in + softens, title lifts away (the "curtain")
//   words — description words light up one by one as it scrolls through
//   frames — each photo drifts inside its frame (parallax)
export const useScrollScene = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const heroMediaRef = useRef<HTMLVideoElement | null>(null);
  const heroShadeRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLDivElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const height = scroller.clientHeight;
      const scrollerTop = scroller.getBoundingClientRect().top;
      const hero = clamp(scroller.scrollTop / height);

      if (heroMediaRef.current) {
        heroMediaRef.current.style.transform = `scale(${1 + hero * 0.12})`;
      }
      if (heroShadeRef.current) {
        heroShadeRef.current.style.opacity = String(hero * 0.25);
      }
      if (heroTitleRef.current) {
        heroTitleRef.current.style.transform = `translateY(${-hero * 60}px)`;
        heroTitleRef.current.style.opacity = String(clamp(1 - hero * 1.6));
      }

      const paragraph = paragraphRef.current;

      if (paragraph) {
        const top = paragraph.getBoundingClientRect().top - scrollerTop;
        const progress = clamp((height * 0.85 - top) / (height * 0.55));
        const words = wordRefs.current;

        words.forEach((word, index) => {
          if (!word) return;
          word.style.opacity = String(
            clamp(progress * words.length - index, 0.18, 1),
          );
        });
      }

      frameRefs.current.forEach((node, index) => {
        const image = imageRefs.current[index];

        if (!node || !image) return;

        const rect = node.getBoundingClientRect();
        const center = rect.top - scrollerTop + rect.height / 2;
        const offset = clamp((center - height / 2) / height, -1, 1);

        image.style.transform = `translateY(${offset * -8}%) scale(1.18)`;
      });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return {
    scrollerRef,
    heroMediaRef,
    heroShadeRef,
    heroTitleRef,
    paragraphRef,
    wordRefs,
    frameRefs,
    imageRefs,
  };
};
