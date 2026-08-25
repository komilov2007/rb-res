"use client";

import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type AtmosphereGalleryProps = {
  images: string[];
};

const AtmosphereGallery = ({ images }: AtmosphereGalleryProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelectImage = (index: number) => {
    setActiveIndex(index);
    swiperRef.current?.slideToLoop(index);
  };

  return (
    <div className="mt-5">
      {images.length === 0 ? (
        <GalleryImage className="h-[230px] rounded-2xl lg:h-[360px]" />
      ) : (
        <>
          <Swiper
            loop={images.length > 1}
            autoplay={
              images.length > 1
                ? {
                    delay: 3000,
                    disableOnInteraction: false,
                  }
                : false
            }
            modules={[Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full"
          >
            {images.map((image) => (
              <SwiperSlide key={image}>
                <GalleryImage
                  src={image}
                  className="h-[230px] rounded-2xl lg:h-[360px]"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {images.length > 1 && (
            <div className="scroll-hidden mt-4 flex items-center justify-center gap-2 overflow-x-auto px-1">
              {images.map((image, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={image}
                    type="button"
                    onClick={() => handleSelectImage(index)}
                    className={`h-9 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity lg:h-11 lg:w-16 ${
                      isActive
                        ? "border-primary opacity-100 ring-2 ring-primary10"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    <img
                      src={image}
                      alt="Atmosfera"
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const GalleryImage = ({
  src,
  className = "",
}: {
  src?: string;
  className?: string;
}) => {
  if (!src) {
    return <div className={`w-full bg-gray10 ${className}`} />;
  }

  return (
    <img
      src={src}
      alt="Restaurant atmosphere"
      className={`w-full object-cover ${className}`}
    />
  );
};

export default AtmosphereGallery;
