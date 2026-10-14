"use client";

import { ArrowRight, Expand } from "lucide-react";
import {
  IconCalendarEventFilled,
  IconClockHour3Filled,
  IconPhoneFilled,
  IconPhotoFilled,
  IconPhotoOff,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useGeneral } from "@/hooks/useGeneral";
import type { AtmosphereMedia } from "@/utils/atmosphere";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import { getTodayHours } from "@/utils/working-time";

const CHUNK_SIZE = 5;

type BentoLayout = { grid: string; tiles: string[] };

const BENTO_LAYOUTS: Record<number, BentoLayout> = {
  1: { grid: "h-[460px] grid-cols-1", tiles: [""] },
  2: { grid: "h-[440px] grid-cols-2", tiles: ["", ""] },
  3: {
    grid: "h-[520px] grid-cols-3 grid-rows-2",
    tiles: ["col-span-2 row-span-2", "", ""],
  },
  4: {
    grid: "h-[520px] grid-cols-4 grid-rows-2",
    tiles: ["col-span-2 row-span-2", "col-span-2", "", ""],
  },
  5: {
    grid: "h-[520px] grid-cols-4 grid-rows-2",
    tiles: ["col-span-2 row-span-2", "", "", "", ""],
  },
};

const MIRRORED_BIG_TILES: Record<number, string> = {
  3: "col-start-2 col-span-2 row-start-1 row-span-2",
  4: "col-start-3 col-span-2 row-start-1 row-span-2",
  5: "col-start-3 col-span-2 row-start-1 row-span-2",
};

const getTileClassName = (count: number, index: number, mirrored: boolean) =>
  mirrored && index === 0 && MIRRORED_BIG_TILES[count]
    ? MIRRORED_BIG_TILES[count]
    : BENTO_LAYOUTS[count].tiles[index];

type BentoGridProps = {
  photos: string[];
  offset: number;
  onOpen: (index: number) => void;
};

const BentoGrid = ({ photos, offset, onOpen }: BentoGridProps) => {
  const t = useTranslations();
  const chunks = Array.from(
    { length: Math.ceil(photos.length / CHUNK_SIZE) },
    (_, index) => photos.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
  );

  return (
    <div className="flex flex-col gap-4">
      {chunks.map((chunk, chunkIndex) => (
        <div
          key={chunkIndex}
          className={`grid gap-4 ${BENTO_LAYOUTS[chunk.length].grid}`}
        >
          {chunk.map((src, index) => {
            const photoIndex = chunkIndex * CHUNK_SIZE + index;

            return (
              <button
                key={`${src}-${photoIndex}`}
                type="button"
                onClick={() => onOpen(offset + photoIndex)}
                className={`group relative overflow-hidden rounded-3xl bg-gray10 ${getTileClassName(chunk.length, index, chunkIndex % 2 === 1)}`}
              >
                <img
                  src={getImageSrc(src)}
                  onError={handleImageFallback}
                  alt={t("booking_gallery_image_alt")}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Emblem = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden
    viewBox="0 0 56 28"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`text-primary ${className}`}
  >
    <path d="M28 26V8" strokeWidth={1.4} />
    <path
      d="M21 15l7 6 7-6M22.5 10l5.5 5 5.5-5M24.5 6l3.5 4 3.5-4"
      strokeWidth={1.2}
    />
    <path d="M15 22C11 18 8 14 4 12M41 22c4-4 7-8 11-10" strokeWidth={1.2} />
    <g fill="currentColor" stroke="none">
      <circle cx={28} cy={4.5} r={1.8} />
      <ellipse cx={9} cy={13} rx={3.5} ry={1.5} transform="rotate(30 9 13)" />
      <ellipse
        cx={47}
        cy={13}
        rx={3.5}
        ry={1.5}
        transform="rotate(-30 47 13)"
      />
      <ellipse cx={12} cy={20} rx={3} ry={1.3} transform="rotate(-20 12 20)" />
      <ellipse cx={44} cy={20} rx={3} ry={1.3} transform="rotate(20 44 20)" />
    </g>
  </svg>
);

const Ornament = () => (
  <span className="flex items-center gap-3">
    <span className="h-px w-20 bg-gradient-to-r from-transparent to-primary" />
    <Emblem className="h-7 w-14" />
    <span className="h-px w-20 bg-gradient-to-l from-transparent to-primary" />
  </span>
);

type AtmosphereDesktopProps = {
  title: string;
  desc: string | null;
  content: AtmosphereMedia;
  onOpen: (index: number) => void;
  onBook: () => void;
};

const AtmosphereDesktop = ({
  title,
  desc,
  content,
  onOpen,
  onBook,
}: AtmosphereDesktopProps) => {
  const t = useTranslations();
  const { video, sections, media } = content;
  const { data } = useGeneral();
  const general = data?.data;
  const todayHours = getTodayHours(general?.working_time);
  const ctaImage = sections.at(-1)?.photos.at(-1) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-12">
      <section className="flex flex-col items-center text-center">
        <Ornament />
        <h1 className="mt-6 text-5xl font-medium leading-tight text-black">
          {title}
        </h1>
        {desc && (
          <p className="mt-4 max-w-2xl whitespace-pre-line text-lg font-normal leading-[1.6] text-gray220">
            {desc}
          </p>
        )}
      </section>

      {media.length > 0 ? (
        <div className="flex flex-col gap-16">
          {video && (
            <section className="relative h-[min(72vh,640px)] min-h-[480px] overflow-hidden rounded-[32px] bg-black">
              <video
                src={video}
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
                className="absolute right-6 top-6 flex h-11 items-center gap-2 rounded-full bg-black/40 px-4 text-sm font-normal text-white backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <Expand size={16} />
                {media.length > 1 && <span>{media.length}</span>}
              </button>
            </section>
          )}

          {sections.map((section) => (
            <section key={section.key} className="flex flex-col gap-6">
              {section.title && (
                <div className="flex items-center justify-between gap-4">
                  <h2 className="flex min-w-0 items-center gap-3 text-3xl font-medium text-black">
                    {section.cover ? (
                      <img
                        src={section.cover}
                        onError={handleImageFallback}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary10 text-primary">
                        <IconPhotoFilled size={22} />
                      </span>
                    )}
                    <span className="truncate">{section.title}</span>
                  </h2>
                  <span className="rounded-full bg-gray10 px-3 py-1 text-sm font-normal text-gray220">
                    {section.photos.length}
                  </span>
                </div>
              )}
              <BentoGrid
                photos={section.photos}
                offset={section.offset}
                onOpen={onOpen}
              />
            </section>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-gray10 px-6 py-10 text-gray220">
          <IconPhotoOff size={22} />
          <p className="text-base font-normal">
            {t("atmosphere_photos_empty")}
          </p>
        </div>
      )}

      <section
        className={`relative flex items-center justify-between gap-8 overflow-hidden rounded-[32px] border border-gray180 py-8 pr-10 ${
          ctaImage
            ? "bg-white pl-[24rem]"
            : "bg-gradient-to-r from-primary10 via-white to-white pl-10"
        }`}
      >
        {ctaImage && (
          <img
            src={getImageSrc(ctaImage)}
            onError={handleImageFallback}
            alt=""
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-[26rem] object-cover [mask-image:linear-gradient(to_right,black_40%,transparent)]"
          />
        )}
        <div className="relative flex min-w-0 items-center gap-5">
          {!ctaImage && (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-primary ring-1 ring-primary/15">
              <IconCalendarEventFilled size={28} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-medium text-black">
              {t("booking_form_title")}
            </h2>
            <p className="mt-1 text-base font-normal text-gray220">
              {t("booking_gallery_description")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-gray180 bg-white px-3 py-1 text-sm font-normal text-gray220">
                <IconClockHour3Filled size={15} className="text-primary" />
                {`${t("location_branch_picker_schedule")}: ${todayHours ?? t("common_closed")}`}
              </span>
              {general?.business_phone && (
                <a
                  href={`tel:${general.business_phone}`}
                  className="flex items-center gap-1.5 rounded-full border border-gray180 bg-white px-3 py-1 text-sm font-normal text-gray220 transition-colors hover:border-primary/40"
                >
                  <IconPhoneFilled size={15} className="text-primary" />
                  {general.business_phone}
                </a>
              )}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          onClick={onBook}
          className="group h-12 w-auto shrink-0 rounded-xl px-8 text-base"
        >
          {t("booking_submit")}
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Button>
      </section>
    </div>
  );
};

export default AtmosphereDesktop;
