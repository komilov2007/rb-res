"use client";

import { getCategories } from "@/apis/categories";
import { CategoriesSkeleton } from "@/components/ui/skleton";
import { useShopid } from "@/hooks/useShopId";
import type { CategoriesProps } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, FreeMode } from "swiper/modules";

const Categories = () => {
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const categories = data?.data ?? [];

  if (isLoading) return <CategoriesSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section
      data-categories
      className="mt-3 flex w-full items-center justify-center rounded-b-[20px] bg-white px-4 pb-4 pt-3 lg:mt-0 lg:rounded-b-none lg:pt-3"
    >
      <div className="w-full max-w-7xl">
        <Swiper
          modules={[A11y, FreeMode]}
          spaceBetween={12}
          freeMode={{ enabled: true }}
          roundLengths={true}
          centeredSlides={false}
          slidesOffsetAfter={0}
          slidesOffsetBefore={0}
          watchOverflow={true}
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

          {/* Removed 'Boshqa' extra slide per request */}
        </Swiper>
      </div>
    </section>
  );
};

export default Categories;
