"use client";

import { useState, type UIEvent } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  ATMOSPHERE_MEDIA,
  ATMOSPHERE_VIDEO_SRC,
  type AtmosphereVariantProps,
} from "../../constants";
import { pad } from "../../utils";

// Mobile variant "two": an immersive walk-through of the restaurant. Every
// slide fills the whole screen and snaps vertically, one "room" per swipe —
// the video first (with the title), then each interior photo. A counter and
// side progress dots show where you are; tapping a slide opens the shared
// full-screen viewer (uncropped photo + thumbnails).
const AtmosphereTwo = ({ onOpen }: AtmosphereVariantProps) => {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const total = ATMOSPHERE_MEDIA.length;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const feed = event.currentTarget;
    const next = Math.round(feed.scrollTop / feed.clientHeight);

    setActiveIndex(Math.min(total - 1, Math.max(0, next)));
  };

  return (
    <div className="relative h-full bg-black">
      <div
        onScroll={handleScroll}
        className="scroll-hidden h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {ATMOSPHERE_MEDIA.map((src, index) => {
          const isVideo = src === ATMOSPHERE_VIDEO_SRC;

          return (
            <button
              key={src}
              type="button"
              onClick={() => onOpen(index)}
              aria-label={t("booking_gallery_image_alt")}
              className="relative block h-full w-full snap-start overflow-hidden text-left"
            >
              {isVideo ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover"
                >
                  <source src={src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={src}
                  alt={t("booking_gallery_image_alt")}
                  loading={index > 1 ? "lazy" : "eager"}
                  className="h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

              {isVideo && (
                // bottom-32 clears the shell's floating "Bron qilish" button.
                <div className="absolute inset-x-5 bottom-32 text-white">
                  <h2 className="max-w-[300px] font-serif text-[40px] font-medium leading-[0.95]">
                    {t("booking_gallery_title")}
                  </h2>
                  <p className="mt-3 text-sm font-normal leading-6 text-white/75">
                    {t("booking_gallery_description")}
                  </p>
                  <ChevronDown
                    size={26}
                    className="mx-auto mt-5 animate-bounce text-white/80"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <span className="pointer-events-none absolute right-4 top-[calc(env(safe-area-inset-top)+20px)] rounded-full bg-black/35 px-3 py-1 text-xs font-normal tabular-nums text-white backdrop-blur-md">
        {pad(activeIndex + 1)} / {pad(total)}
      </span>

      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
        {ATMOSPHERE_MEDIA.map((src, index) => (
          <span
            key={src}
            className={`w-1 rounded-full transition-all duration-300 ${
              index === activeIndex ? "h-6 bg-white" : "h-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AtmosphereTwo;
