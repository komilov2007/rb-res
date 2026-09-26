"use client";

import { ArrowRight, Expand } from "lucide-react";
import { IconPhotoFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { galleryImages } from "@/constants/atmosphere";

import { ATMOSPHERE_VIDEO_SRC, type AtmosphereVariantProps } from "../../constants";

// Bento placement for the six gallery photos on a 4-column grid:
// row 1: A A B C · row 2: A A D D · row 3: E E F F.
const TILE_CLASS_NAMES = [
  "col-span-2 row-span-2",
  "",
  "",
  "col-span-2",
  "col-span-2",
  "col-span-2",
];

type AtmosphereDesktopProps = AtmosphereVariantProps & {
  onBook: () => void;
};

// Desktop /atmosphere: hero (story + video + booking button), then a bento
// gallery. Photos and the video open the page's shared full-screen
// viewer (index 0 = video, photo i = i + 1), same as the mobile variants.
const AtmosphereDesktop = ({ onOpen, onBook }: AtmosphereDesktopProps) => {
  const t = useTranslations();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-10">
      <section className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-14">
        <div>
          {/* Decorative accent only — the description is the one text here. */}
          <span className="block h-1 w-14 rounded-full bg-primary" />
          <p className="mt-7 max-w-[540px] text-[22px] font-normal leading-[1.6] text-black/80">
            {t("atmosphere_description")}
          </p>
          <Button
            type="button"
            variant="primary-solid"
            size="primaryWide"
            onClick={onBook}
            className="mt-10 h-12 w-auto rounded-xl px-8 text-base"
          >
            {t("booking_submit")}
            <ArrowRight size={18} />
          </Button>
        </div>

        <div className="group relative h-[460px] overflow-hidden rounded-[32px] bg-black">
          <video
            src={ATMOSPHERE_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onOpen(0)}
            aria-label={t("atmosphere_title")}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55"
          >
            <Expand size={18} />
          </button>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="flex items-center gap-2.5 text-2xl font-medium text-black">
            <IconPhotoFilled size={24} className="text-primary" />
            {t("atmosphere_gallery_title")}
          </h2>
          <span className="text-sm font-normal text-gray220">
            {galleryImages.length}
          </span>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => onOpen(index + 1)}
              className={`group relative overflow-hidden rounded-3xl bg-gray10 ${TILE_CLASS_NAMES[index] ?? ""}`}
            >
              <img
                src={image.src}
                alt={t("booking_gallery_image_alt")}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AtmosphereDesktop;
