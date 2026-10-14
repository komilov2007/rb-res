"use client";

import { Maximize2 } from "lucide-react";
import { IconPhotoFilled, IconPhotoOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { AtmosphereMedia, AtmosphereSection } from "@/utils/atmosphere";
import { getImageSrc, handleImageFallback } from "@/utils/image";

const TILE_HEIGHTS = ["h-52", "h-36", "h-40", "h-56", "h-44", "h-36"];

type AtmosphereMobileProps = {
  title: string;
  desc: string | null;
  content: AtmosphereMedia;
  onOpen: (index: number) => void;
};

type AtmosphereHeroProps = Pick<AtmosphereMedia, "video" | "cover"> & {
  onOpen: () => void;
};

const AtmosphereHero = ({ video, cover, onOpen }: AtmosphereHeroProps) => {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("atmosphere_title")}
      className="relative block h-[62dvh] min-h-[380px] w-full shrink-0 overflow-hidden bg-black text-left"
    >
      {video ? (
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={getImageSrc(cover)}
          onError={handleImageFallback}
          alt={t("booking_gallery_image_alt")}
          className="h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/80" />

      <span className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md">
        <Maximize2 size={18} />
      </span>
    </button>
  );
};

type AtmospherePhotosProps = {
  section: AtmosphereSection;
  onOpen: (index: number) => void;
};

const AtmospherePhotos = ({ section, onOpen }: AtmospherePhotosProps) => {
  const t = useTranslations();

  return (
    <div>
      {section.title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-medium text-black">
            {section.cover ? (
              <img
                src={section.cover}
                onError={handleImageFallback}
                alt=""
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
            ) : (
              <IconPhotoFilled size={18} className="shrink-0 text-gray220" />
            )}
            <span className="truncate">{section.title}</span>
          </h2>
          <span className="text-xs font-normal text-gray220">
            {section.photos.length}
          </span>
        </div>
      )}

      <div className="columns-2 gap-2">
        {section.photos.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => onOpen(section.offset + index)}
            className={`${TILE_HEIGHTS[index % TILE_HEIGHTS.length]} mb-2 block w-full break-inside-avoid overflow-hidden rounded-xl bg-gray10`}
          >
            <img
              src={getImageSrc(src)}
              onError={handleImageFallback}
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

const AtmosphereMobile = ({
  title,
  desc,
  content,
  onOpen,
}: AtmosphereMobileProps) => {
  const t = useTranslations();
  const { video, cover, sections } = content;
  const hasHero = Boolean(video || cover);

  return (
    <>
      {hasHero && (
        <AtmosphereHero video={video} cover={cover} onOpen={() => onOpen(0)} />
      )}

      <div
        className={`relative z-10 flex flex-1 flex-col bg-white px-4 pb-6 ${
          hasHero
            ? "-mt-6 rounded-t-[24px] pt-5"
            : "pt-[calc(env(safe-area-inset-top)+72px)]"
        }`}
      >
        {hasHero && (
          <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-gray180" />
        )}

        <h1 className="text-lg font-medium text-black">{title}</h1>
        {desc && (
          <p className="mt-2 whitespace-pre-line text-sm font-normal leading-6 text-gray220">
            {desc}
          </p>
        )}

        {sections.length > 0 && (
          <div className="mt-6 flex flex-col gap-6">
            {sections.map((section) => (
              <AtmospherePhotos
                key={section.key}
                section={section}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}

        {!hasHero && (
          <div className="mt-6 flex flex-col items-center rounded-xl bg-gray10 px-4 py-8 text-center">
            <IconPhotoOff size={24} className="text-gray220" />
            <p className="mt-2 text-sm font-normal text-gray220">
              {t("atmosphere_photos_empty")}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AtmosphereMobile;
