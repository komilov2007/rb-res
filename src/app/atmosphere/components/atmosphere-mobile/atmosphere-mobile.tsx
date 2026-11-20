"use client";

import type { ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { IconPhotoOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { AtmosphereMedia } from "@/utils/atmosphere";
import { getImageSrc, handleImageFallback } from "@/utils/image";

type AtmosphereMobileProps = {
  tabs: ReactNode;
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

      <span className="absolute right-4 top-[calc(var(--safe-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md">
        <Maximize2 size={18} />
      </span>
    </button>
  );
};

type AtmospherePhoto = { src: string; index: number };

type AtmospherePhotosProps = {
  photos: AtmospherePhoto[];
  onOpen: (index: number) => void;
};

// One continuous masonry flow: every photo keeps its natural aspect ratio
// (no cropping), and sections are merged so there are no gaps between them.
const AtmospherePhotos = ({ photos, onOpen }: AtmospherePhotosProps) => {
  const t = useTranslations();

  return (
    <div className="columns-2 gap-2">
      {photos.map(({ src, index }) => (
        <button
          key={`${src}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          className="mb-2 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-gray10"
        >
          <img
            src={getImageSrc(src)}
            onError={handleImageFallback}
            alt={t("booking_gallery_image_alt")}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-300 active:scale-[1.03]"
          />
        </button>
      ))}
    </div>
  );
};

const AtmosphereMobile = ({
  tabs,
  desc,
  content,
  onOpen,
}: AtmosphereMobileProps) => {
  const t = useTranslations();
  const { video, cover, sections } = content;
  const hasHero = Boolean(video || cover);
  const photos = sections.flatMap((section) =>
    section.photos.map((src, i) => ({ src, index: section.offset + i })),
  );

  return (
    <>
      {hasHero && (
        <AtmosphereHero video={video} cover={cover} onOpen={() => onOpen(0)} />
      )}

      <div
        className={`relative z-10 flex flex-1 flex-col bg-white px-4 pb-6 ${
          hasHero
            ? "-mt-6 rounded-t-[24px] pt-5"
            : "pt-[calc(var(--safe-top)+72px)]"
        }`}
      >
        {hasHero && (
          <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-gray180" />
        )}

        <h1 className="text-lg font-medium text-black">
          {t("atmosphere_title")}
        </h1>
        {desc && (
          <p className="mt-2 whitespace-pre-line text-sm font-normal leading-6 text-gray220">
            {desc}
          </p>
        )}

        {tabs && <div className="-mx-4 mt-5 min-w-0">{tabs}</div>}

        {photos.length > 0 && (
          <div className="mt-4">
            <AtmospherePhotos photos={photos} onOpen={onOpen} />
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
