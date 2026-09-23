"use client";

import { Images } from "lucide-react";
import { useTranslations } from "next-intl";

import { galleryImages } from "@/constants/atmosphere";

type AtmospherePhotosProps = {
  // Grid index of the tapped photo.
  onOpen: (index: number) => void;
};

// Alternating tile heights so the two columns stagger into a masonry
// grid instead of lining up as a plain table of equal squares.
const TILE_HEIGHTS = ["h-52", "h-36", "h-40", "h-56", "h-44", "h-36"];

// Mobile-only body: description + tappable photo grid. The full-screen
// viewer itself lives in atmosphere.tsx, shared with the hero video.
const AtmospherePhotos = ({ onOpen }: AtmospherePhotosProps) => {
  const t = useTranslations();

  return (
    <div className="relative z-10 -mt-6 rounded-t-[24px] bg-white px-4 pb-6 pt-5">
      <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-gray180" />

      <p className="text-sm font-normal leading-6 text-gray220">
        {t("booking_gallery_description")}
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

export default AtmospherePhotos;
