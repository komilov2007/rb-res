"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { galleryImages } from "@/constants/atmosphere";
import { ATMOSPHERE_VIDEO_SRC, type AtmosphereVariantProps } from "@/app/atmosphere/atmosphere";
import { pad } from "@/app/atmosphere/atmosphere";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

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

const FRAMES = [
  "aspect-[4/5]",
  "mx-10 aspect-square",
  "aspect-[3/4]",
  "mx-10 aspect-[4/5]",
  "aspect-[4/5]",
  "mx-10 aspect-square",
];

const AtmosphereFour = ({ onOpen }: AtmosphereVariantProps) => {
  const t = useTranslations();
  const {
    scrollerRef,
    heroMediaRef,
    heroShadeRef,
    heroTitleRef,
    paragraphRef,
    wordRefs,
    frameRefs,
    imageRefs,
  } = useScrollScene();
  const descriptionWords = t("atmosphere_description").split(" ");

  return (
    <div
      ref={scrollerRef}
      className="scroll-hidden relative h-full overflow-y-auto overscroll-contain bg-gray220 text-white"
    >
      <button
        type="button"
        onClick={() => onOpen(0)}
        aria-label={t("atmosphere_title")}
        className="sticky top-0 block h-full w-full overflow-hidden text-left"
      >
        <video
          ref={heroMediaRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover will-change-transform"
        >
          <source src={ATMOSPHERE_VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/75" />
        <div
          ref={heroShadeRef}
          className="absolute inset-0 bg-black opacity-0"
        />

        <div
          ref={heroTitleRef}
          className="absolute inset-x-6 bottom-32 text-white"
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md"
            style={{ animation: "atmosphere-fade 1s ease-out 900ms both" }}
          >
            <ChevronDown size={20} className="animate-bounce" />
          </span>
        </div>
      </button>

      <div className="relative z-10 -mt-8 rounded-t-[32px] bg-white/10 pb-32 pt-16 backdrop-blur-3xl backdrop-saturate-150">
        <p
          ref={paragraphRef}
          className="px-6 font-serif text-[26px] leading-[1.3]"
        >
          {descriptionWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              ref={(node) => {
                wordRefs.current[index] = node;
              }}
              className="opacity-20 transition-opacity duration-200"
            >
              {word}{" "}
            </span>
          ))}
        </p>

        <div className="mt-20 flex items-end justify-between px-6">
          <h3 className="font-serif text-[30px] leading-none">
            {t("atmosphere_gallery_title")}
          </h3>
          <span className="text-xs tracking-[0.3em] text-white/60">
            {pad(galleryImages.length)}
          </span>
        </div>
        <span className="mx-6 mt-5 block h-px bg-white/20" />

        <div className="mt-10 flex flex-col gap-14">
          {galleryImages.map((image, index) => (
            <div key={image.src}>
              <div
                ref={(node) => {
                  frameRefs.current[index] = node;
                }}
                className={`${FRAMES[index % FRAMES.length]} overflow-hidden`}
              >
                <button
                  type="button"
                  onClick={() => onOpen(index + 1)}
                  className="block h-full w-full"
                >
                  <img
                    ref={(node) => {
                      imageRefs.current[index] = node;
                    }}
                    src={image.src}
                    alt={t("booking_gallery_image_alt")}
                    loading="lazy"
                    className="h-full w-full scale-[1.18] object-cover will-change-transform"
                  />
                </button>
              </div>
              <p
                className={`mt-4 text-[11px] tracking-[0.35em] text-white/60 ${
                  FRAMES[index % FRAMES.length].startsWith("mx-10")
                    ? "px-10"
                    : "px-6"
                }`}
              >
                {pad(index + 1)} / {pad(galleryImages.length)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes atmosphere-rise { from { transform: translateY(110%) } to { transform: translateY(0) } }
        @keyframes atmosphere-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
};

export { AtmosphereFour };

export default AtmosphereFour;
