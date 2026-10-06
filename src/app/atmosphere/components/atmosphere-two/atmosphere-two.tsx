"use client";

import { useState, type UIEvent } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ATMOSPHERE_MEDIA, ATMOSPHERE_VIDEO_SRC, type AtmosphereVariantProps } from "@/app/atmosphere/atmosphere";
import { pad } from "@/app/atmosphere/atmosphere";
import type { AtmosphereVariantProps as AtmosphereVariantPropsAtmosphereOne } from "@/app/atmosphere/atmosphere";
import { AtmosphereHero } from "@/app/atmosphere/components/atmosphere-desktop-preview";
import { AtmospherePhotosAtmospherePhotos as AtmospherePhotos } from "@/app/atmosphere/components/atmosphere-two";
import { Images } from "lucide-react";
import { useTranslations as useTranslationsAtmospherePhotos } from "next-intl";
import { galleryImages } from "@/constants/atmosphere";

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
                <div className="absolute inset-x-5 bottom-32 text-white">
                  <p className="text-sm font-normal leading-6 text-white/75">
                    {t("atmosphere_description")}
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

const AtmosphereOne = ({ onOpen }: AtmosphereVariantPropsAtmosphereOne) => {
  return (
    <>
      <AtmosphereHero onOpen={() => onOpen(0)} />
      <AtmospherePhotos onOpen={(index) => onOpen(index + 1)} />
    </>
  );
};

type AtmospherePhotosAtmospherePhotosProps = {
  onOpen: (index: number) => void;
};

const TILE_HEIGHTS = ["h-52", "h-36", "h-40", "h-56", "h-44", "h-36"];

const AtmospherePhotosAtmospherePhotos = ({ onOpen }: AtmospherePhotosAtmospherePhotosProps) => {
  const t = useTranslationsAtmospherePhotos();

  return (
    <div className="relative z-10 -mt-6 rounded-t-[24px] bg-white px-4 pb-6 pt-5">
      <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-gray180" />

      <p className="text-sm font-normal leading-6 text-gray220">
        {t("atmosphere_description")}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-black">
          <Images size={18} className="text-gray220" />
          {t("atmosphere_gallery_title")}
        </h3>
        <span className="text-xs font-normal text-gray220">
          {galleryImages.length}
        </span>
      </div>

      <div className="mt-3 columns-2 gap-2">
        {galleryImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => onOpen(index)}
            className={`${TILE_HEIGHTS[index % TILE_HEIGHTS.length]} mb-2 block w-full break-inside-avoid overflow-hidden rounded-xl bg-gray10`}
          >
            <img
              src={image.src}
              alt={t("booking_gallery_image_alt")}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 active:scale-[1.03]"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export { AtmosphereOne, AtmospherePhotosAtmospherePhotos };
