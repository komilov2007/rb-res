"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import GalleryArrow from "./components/gallery-arrow";
import GalleryModal from "./components/gallery-modal";
import GalleryStyles from "./components/gallery-styles";
import { galleryImages, posterSrc, videoSrc } from "@/constants/atmosphere";

const AtmosphereGallery = () => {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const loopImages = [...galleryImages, ...galleryImages, ...galleryImages];

  const handleScroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="lg:mt-4">
      <div className="grid items-center gap-5 lg:grid-cols-[1.35fr_0.85fr] lg:gap-9">
        <div className="overflow-hidden rounded-l-xl rounded-r-[44px] bg-black lg:rounded-r-[96px]">
          <video
            controls
            muted
            playsInline
            poster={posterSrc}
            className="h-[210px] w-full object-cover lg:h-[370px]"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        <div className="lg:pl-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-black lg:text-xs lg:tracking-[0.45em]">
            {t("booking_gallery_eyebrow")}
          </p>
          <div className="mt-3 flex items-center gap-2 lg:mt-4">
            <span className="h-px w-14 bg-black" />
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-black/30" />
          </div>
          <h2 className="mt-4 max-w-[430px] font-serif text-[36px] font-medium leading-[0.95] text-black lg:mt-7 lg:text-[64px]">
            {t("booking_gallery_title")}
          </h2>
          <p className="mt-3 max-w-[520px] text-sm font-medium leading-6 text-gray220 lg:mt-6 lg:text-base lg:leading-7">
            {t("booking_gallery_description")}
          </p>
        </div>
      </div>

      <div className="group relative -mx-4 mt-6 overflow-hidden lg:mx-0 lg:mt-8">
        <div
          ref={scrollRef}
          className="scroll-hidden overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="atmosphere-marquee flex w-max gap-2 lg:gap-4">
            {loopImages.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => setActiveImage(image.src)}
                className={`${image.width} h-[118px] shrink-0 overflow-hidden rounded-xl bg-gray10 lg:h-[178px]`}
              >
                <img
                  src={image.src}
                  alt={t("booking_gallery_image_alt")}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <GalleryArrow
          direction="left"
          onClick={() => handleScroll("left")}
          className="left-3"
        />
        <GalleryArrow
          direction="right"
          onClick={() => handleScroll("right")}
          className="right-3"
        />
      </div>

      <GalleryModal
        activeImage={activeImage}
        onClose={() => setActiveImage(null)}
        onSelect={setActiveImage}
      />
      <GalleryStyles />
    </div>
  );
};

export default AtmosphereGallery;
