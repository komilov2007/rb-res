"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { galleryImages } from "@/constants/atmosphere";

import { ATMOSPHERE_VIDEO_SRC, type AtmosphereVariantProps } from "../../constants";
import { pad } from "../../utils";
import { useScrollScene } from "./useScrollScene";

// Alternating frames: full-bleed tall, then inset — the rhythm of a
// printed lookbook.
const FRAMES = [
  "aspect-[4/5]",
  "mx-10 aspect-square",
  "aspect-[3/4]",
  "mx-10 aspect-[4/5]",
  "aspect-[4/5]",
  "mx-10 aspect-square",
];

// Mobile variant "four": cinematic, luxury-brand feel. The video fills
// the screen and stays put while a frosted-glass sheet slides up over it
// like a curtain (the live video stays visible, blurred, behind the whole
// page; it zooms + softens and the title lifts away); the description's
// words light up as you read down; photos drift inside their frames.
// All motion is scroll-driven in useScrollScene; no solid black/white bg.
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
  const titleWords = t("booking_gallery_title").split(" ");
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
        <div ref={heroShadeRef} className="absolute inset-0 bg-black opacity-0" />

        <div ref={heroTitleRef} className="absolute inset-x-6 bottom-32 text-white">
          <h2 className="font-serif text-[46px] font-medium leading-[0.95] tracking-[-0.01em]">
            {titleWords.map((word, index) => (
              <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-1 align-bottom">
                <span
                  className="inline-block"
                  style={{
                    animation: `atmosphere-rise 1100ms cubic-bezier(0.2, 0.7, 0.2, 1) ${150 + index * 140}ms both`,
                  }}
                >
                  {word}&nbsp;
                </span>
              </span>
            ))}
          </h2>
          <span
            className="mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md"
            style={{ animation: "atmosphere-fade 1s ease-out 900ms both" }}
          >
            <ChevronDown size={20} className="animate-bounce" />
          </span>
        </div>
      </button>

      <div className="relative z-10 -mt-8 rounded-t-[32px] bg-white/10 pb-32 pt-16 backdrop-blur-3xl backdrop-saturate-150">
        <p ref={paragraphRef} className="px-6 font-serif text-[26px] leading-[1.3]">
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
                  FRAMES[index % FRAMES.length].startsWith("mx-10") ? "px-10" : "px-6"
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

export default AtmosphereFour;
