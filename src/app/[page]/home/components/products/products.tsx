"use client";

import CardProduct from "@/components/card-product";
import { BadgePercent } from "lucide-react";
import { ProductsSkeleton } from "@/components/ui/skleton";
import { useProduct } from "./useProduct";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, FreeMode } from "swiper/modules";

const Products = () => {
  const {
    products,
    bottomRef,
    isLoading,
    productGroups,
    discountProducts,
    isFetchingNextPage,
  } = useProduct();

  if (isLoading) return <ProductsSkeleton />;
  if (products.length === 0) return null;

  return (
    <section className="mb-5 flex w-full items-center justify-center px-4 py-6 lg:mb-0 lg:py-8">
      <div className="flex w-full max-w-7xl flex-col gap-7 lg:gap-8">
        {discountProducts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow10">
                <BadgePercent size={22} className="text-yellow" />
              </span>
              <h2 className="text-xl font-bold text-black lg:text-2xl">
                Chegirmadagi mahsulotlar
              </h2>
            </div>

            <Swiper
              modules={[A11y, FreeMode]}
              spaceBetween={12}
              freeMode={{ enabled: true }}
              centeredSlides={false}
              breakpoints={{
                320: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
              className="pb-2 overflow-hidden"
            >
              {discountProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="w-full">
                    <CardProduct product={product} variant="discount" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {productGroups.map((group) => (
          <div key={group.id}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className=" lg:mb-0 text-xl font-bold text-black lg:text-2xl">
                {group.name}
              </h2>

              <div className="ml-4 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray20 text-blue30  px-2 py-0.5 text-[12px] font-semibold text-black">
                  Barchasini ko'rish ({group.total})
                </span>
              </div>
            </div>

            <Swiper
              modules={[A11y, FreeMode]}
              spaceBetween={12}
              freeMode={{ enabled: true }}
              centeredSlides={false}
              breakpoints={{
                320: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
              className="pb-2 overflow-hidden"
            >
              {group.products.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="w-full">
                    <CardProduct product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}

        <div ref={bottomRef} className="h-px" />
        {isFetchingNextPage && (
          <div className="opacity-80">
            <ProductsSkeleton />
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
