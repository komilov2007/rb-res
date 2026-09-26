"use client";

import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  ATMOSPHERE_MEDIA,
  ATMOSPHERE_VIDEO_SRC,
  type AtmosphereVariantProps,
} from "../../constants";
import { pad } from "../../utils";

const PHOTO_DURATION = 6000;
const VIDEO_DURATION = 9000;

const getDuration = (src: string) =>
  src === ATMOSPHERE_VIDEO_SRC ? VIDEO_DURATION : PHOTO_DURATION;

// Mobile variant "three": a "look around the room" auto-tour. One scene at
// a time fills the screen; photos drift slowly (Ken Burns zoom + pan, the
// direction alternating per scene) so it feels like turning your head
// inside the hall, and scenes cross-fade on their own like stories.
// Tap right = next, tap left = previous, the corner button opens the
// shared full-screen viewer on the current scene.
const AtmosphereThree = ({ onOpen }: AtmosphereVariantProps) => {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const total = ATMOSPHERE_MEDIA.length;
  const duration = getDuration(ATMOSPHERE_MEDIA[activeIndex]);

  const goTo = (next: number) => setActiveIndex((next + total) % total);

  // Auto-advance; restarts whenever the scene changes (tap or timer).
  useEffect(() => {
    const timer = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % total),
      duration,
    );

    return () => window.clearTimeout(timer);
  }, [activeIndex, duration, total]);

  return (
    <div className="relative h-full overflow-hidden bg-black text-white">
      {ATMOSPHERE_MEDIA.map((src, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={src}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            {src === ATMOSPHERE_VIDEO_SRC ? (
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
                // Re-keyed per visit so the drift restarts from the start.
                key={isActive ? `${src}-active` : src}
                src={src}
                alt={t("booking_gallery_image_alt")}
                className="h-full w-full object-cover"
                style={
                  isActive
                    ? {
                        animation: `atmosphere-look-${index % 2 ? "left" : "right"} ${duration + 1000}ms ease-out forwards`,
                      }
                    : undefined
                }
              />
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {/* Tap zones: left third goes back, the rest goes forward. */}
      <button
        type="button"
        onClick={() => goTo(activeIndex - 1)}
        aria-label={t("common_back")}
        className="absolute inset-y-0 left-0 w-1/3"
      />
      <button
        type="button"
        onClick={() => goTo(activeIndex + 1)}
        aria-label={t("common_continue")}
        className="absolute inset-y-0 right-0 w-2/3"
      />

      <div className="pointer-events-none absolute inset-x-3 top-[calc(env(safe-area-inset-top)+4px)] flex gap-1">
        {ATMOSPHERE_MEDIA.map((src, index) => (
          <span key={src} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <span
              key={index === activeIndex ? `${src}-${activeIndex}` : src}
              className="block h-full bg-white"
              style={
                index === activeIndex
                  ? { animation: `atmosphere-fill ${duration}ms linear forwards` }
                  : { width: index < activeIndex ? "100%" : "0%" }
              }
            />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onOpen(activeIndex)}
        aria-label={t("atmosphere_gallery_title")}
        className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-md"
      >
        <Maximize2 size={18} />
      </button>

      {/* bottom-32 clears the shell's floating "Bron qilish" button. */}
      <div className="pointer-events-none absolute inset-x-5 bottom-32">
        <span className="text-xs font-normal tabular-nums text-white/70">
          {pad(activeIndex + 1)} / {pad(total)}
        </span>
        <p className="mt-2 text-sm font-normal leading-6 text-white/75">
          {t("atmosphere_description")}
        </p>
      </div>

      <style>{`
        @keyframes atmosphere-fill { from { width: 0% } to { width: 100% } }
        @keyframes atmosphere-look-right {
          from { transform: scale(1.18) translateX(-4%) }
          to { transform: scale(1.05) translateX(4%) }
        }
        @keyframes atmosphere-look-left {
          from { transform: scale(1.18) translateX(4%) }
          to { transform: scale(1.05) translateX(-4%) }
        }
      `}</style>
    </div>
  );
};

export default AtmosphereThree;
