"use client";

import { getCategories } from "@/apis/categories";
import Button from "@/components/ui/button";
import { CategoriesSkeleton } from "@/components/ui/skleton";
import { useShopid } from "@/hooks/useShopId";
import type { CategoriesProps } from "@/types/categories";
import { normalizeCategories } from "@/utils/product";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, FreeMode } from "swiper/modules";

const Categories = () => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const categories = normalizeCategories(data?.data);

  const updateNavigation = (currentSwiper: SwiperClass) => {
    setIsBeginning(currentSwiper.isBeginning);
    setIsEnd(currentSwiper.isEnd);
  };

  if (isLoading) {
    return (
      <div className="hidden lg:block">
        <CategoriesSkeleton />
      </div>
    );
  }
  if (categories.length === 0) return null;

  return (
    <section className="hidden w-full items-center justify-center overflow-x-hidden rounded-b-[20px] bg-white px-4 pb-4 pt-3 lg:mt-0 lg:flex lg:rounded-b-none lg:pt-3">
      <div className="relative w-full max-w-7xl overflow-visible max-lg:overflow-hidden">
        {!isBeginning && (
          <Button
            variant="swiperNav"
            size="swiperNav"
            aria-label="Oldingi kategoriyalar"
            onClick={() => swiper?.slidePrev()}
            className="absolute -left-12 top-[38%] z-20 hidden -translate-y-1/2 lg:flex"
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </Button>
        )}

        <Swiper
          modules={[A11y, FreeMode]}
          spaceBetween={12}
          freeMode={{ enabled: true }}
          roundLengths={true}
          centeredSlides={false}
          slidesOffsetAfter={0}
          slidesOffsetBefore={0}
          watchOverflow={true}
          onSwiper={(currentSwiper) => {
            setSwiper(currentSwiper);
            updateNavigation(currentSwiper);
          }}
          onSlideChange={updateNavigation}
          onReachBeginning={updateNavigation}
          onReachEnd={updateNavigation}
          onFromEdge={updateNavigation}
          breakpoints={{
            320: { slidesPerView: 4 },
            480: { slidesPerView: 5 },
            900: { slidesPerView: 7 },
            1024: { slidesPerView: 9 },
          }}
          className="pb-1"
        >
          {categories.map((item: CategoriesProps) => (
            <SwiperSlide key={item.id}>
              <div className="w-full flex justify-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-[78px] w-[86px] items-center justify-center overflow-hidden rounded-2xl bg-gray10 lg:h-[100px] lg:w-[112px]">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="max-w-[86px] text-center text-sm font-semibold text-black lg:max-w-[112px] whitespace-normal break-words">
                    {item.name}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {!isEnd && (
          <Button
            variant="swiperNav"
            size="swiperNav"
            aria-label="Keyingi kategoriyalar"
            onClick={() => swiper?.slideNext()}
            className="absolute -right-12 top-[38%] z-20 hidden -translate-y-1/2 lg:flex"
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </Button>
        )}
      </div>
    </section>
  );
};

export default Categories;
