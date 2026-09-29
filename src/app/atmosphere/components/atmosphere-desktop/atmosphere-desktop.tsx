"use client";

import { ArrowRight, Expand } from "lucide-react";
import { IconPhotoFilled, IconToolsKitchen2Filled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { galleryImages, menuImages } from "@/constants/atmosphere";

import {
  ATMOSPHERE_VIDEO_SRC,
  MENU_MEDIA_OFFSET,
  type AtmosphereVariantProps,
} from "../../constants";

// A section shows at most four tiles; the fourth then carries a "+N" chip.
const MAX_TILES = 4;

// Tile layout by how many photos the section has, on a full-width 4-column
// grid of fixed height ("Menyu" and "Galereya" are stacked one under the
// other): 1 — one wide tile · 2 — two halves · 3 — a large tile + two wide
// ones stacked · 4+ — a large tile + one wide + two small (bento).
const GRID_CLASS_NAMES: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-2 grid-rows-1",
  3: "grid-cols-4 grid-rows-2",
  4: "grid-cols-4 grid-rows-2",
};

const TILE_CLASS_NAMES: Record<number, string[]> = {
  3: ["col-span-2 row-span-2", "col-span-2", "col-span-2"],
  4: ["col-span-2 row-span-2", "col-span-2", "", ""],
};

const getTileClassName = (count: number, index: number) =>
  TILE_CLASS_NAMES[count]?.[index] ?? "";

type PhotoColumnProps = {
  title: string;
  icon: React.ReactNode;
  images: { src: string }[];
  // Viewer index of this column's first photo.
  mediaOffset: number;
  onOpen: (index: number) => void;
};

const PhotoColumn = ({
  title,
  icon,
  images,
  mediaOffset,
  onOpen,
}: PhotoColumnProps) => {
  const t = useTranslations();
  const tiles = images.slice(0, MAX_TILES);
  const hidden = images.length - tiles.length;

  return (
    <div className="min-w-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-2xl font-medium text-black">
          {icon}
          {title}
        </h2>
        <span className="rounded-full bg-gray10 px-3 py-1 text-sm font-normal text-gray220">
          {images.length}
        </span>
      </div>

      <div
        className={`grid h-[440px] gap-4 ${GRID_CLASS_NAMES[tiles.length] ?? GRID_CLASS_NAMES[MAX_TILES]}`}
      >
        {tiles.map((image, index) => {
          const isLast = index === tiles.length - 1;

          return (
            <button
              key={image.src}
              type="button"
              onClick={() => onOpen(mediaOffset + index)}
              className={`group relative overflow-hidden rounded-3xl bg-gray10 ${getTileClassName(tiles.length, index)}`}
            >
              <img
                src={image.src}
                alt={t("booking_gallery_image_alt")}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
              {isLast && hidden > 0 && (
                <span className="absolute inset-0 grid place-items-center bg-black/50 text-3xl font-medium text-white backdrop-blur-[2px]">
                  +{hidden}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

type AtmosphereDesktopProps = AtmosphereVariantProps & {
  onBook: () => void;
  // TEMPORARY — the preview's photo count per column (1-4); all when unset.
  photoCount?: number;
};

// Desktop /atmosphere: hero (story + video + booking button), then two
// photo columns side by side — "Menyu" and "Galereya". Photos and the video open the page's shared full-screen
// viewer (index 0 = video, photo i = i + 1), same as the mobile variants.
const AtmosphereDesktop = ({
  onOpen,
  onBook,
  photoCount,
}: AtmosphereDesktopProps) => {
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

      <section className="flex flex-col gap-12">
        <PhotoColumn
          title={t("atmosphere_menu_title")}
          icon={<IconToolsKitchen2Filled size={24} className="text-primary" />}
          images={menuImages.slice(0, photoCount)}
          mediaOffset={MENU_MEDIA_OFFSET}
          onOpen={onOpen}
        />
        <PhotoColumn
          title={t("atmosphere_gallery_title")}
          icon={<IconPhotoFilled size={24} className="text-primary" />}
          images={galleryImages.slice(0, photoCount)}
          mediaOffset={1}
          onOpen={onOpen}
        />
      </section>
    </div>
  );
};

export default AtmosphereDesktop;
