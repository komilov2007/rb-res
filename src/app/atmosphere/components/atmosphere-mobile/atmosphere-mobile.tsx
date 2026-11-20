"use client";

import type { ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { IconPhotoOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { AtmosphereMedia, AtmosphereSection } from "@/utils/atmosphere";
import { getImageSrc, handleImageFallback } from "@/utils/image";

// Rhythm: one wide tile, then two rows of square pairs. A tile left alone
// at the end of a pair row stretches to full width so no gaps remain.
const isWideTile = (index: number, total: number) => {
  const position = index % 5;
  if (position === 0) return true;
  const startsPair = position === 1 || position === 3;
  return startsPair && index === total - 1;
};

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

      <span className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md">
        <Maximize2 size={18} />
      </span>
    </button>
  );
};

type AtmospherePhotosProps = {
  section: AtmosphereSection;
  showTitle: boolean;
  onOpen: (index: number) => void;
};

const AtmospherePhotos = ({
  section,
  showTitle,
  onOpen,
}: AtmospherePhotosProps) => {
  const t = useTranslations();

  return (
    <div>
      {showTitle && section.title && (
        <h2 className="mb-3 text-base font-medium text-black">
          {section.title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-2">
        {section.photos.map((src, index) => {
          const wide = isWideTile(index, section.photos.length);

          return (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onOpen(section.offset + index)}
              className={`block w-full overflow-hidden rounded-2xl bg-gray10 ${
                wide ? "col-span-2 aspect-[16/10]" : "aspect-square"
              }`}
            >
              <img
                src={getImageSrc(src)}
                onError={handleImageFallback}
                alt={t("booking_gallery_image_alt")}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 active:scale-[1.03]"
              />
            </button>
          );
        })}
      </div>
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

        <h1 className="text-lg font-medium text-black">
          {t("atmosphere_title")}
        </h1>
        {desc && (
          <p className="mt-2 whitespace-pre-line text-sm font-normal leading-6 text-gray220">
            {desc}
          </p>
        )}

        {tabs && <div className="-mx-4 mt-5 min-w-0">{tabs}</div>}

        {sections.length > 0 && (
          <div className="mt-4 flex flex-col gap-7">
            {sections.map((section) => (
              <AtmospherePhotos
                key={section.key}
                section={section}
                showTitle={sections.length > 1}
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
