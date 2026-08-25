"use client";
import "swiper/css";
import { useState } from "react";
import { useProduct } from "./useProduct";
import { A11y, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import CardProduct from "@/components/card-product";
import Button from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { Swiper as SwiperClass } from "swiper";
import type { ProductProps } from "@/types/product";
import { ProductsSkeleton } from "@/components/ui/skleton";
import { BadgePercent, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductSwiperProps {
  products: ProductProps[];
  variant?: "discount";
}

const Products = () => {
  const t = useTranslations();
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
    <section className="mb-5 flex w-full items-center justify-center overflow-x-hidden px-4 py-6 lg:mb-0 lg:py-8">
      <div className="flex w-full max-w-7xl flex-col gap-7 lg:gap-8">
        {discountProducts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow10">
                <BadgePercent size={22} className="text-yellow" />
              </span>
              <h2 className="title50 text-black lg:text-2xl">
                {t("discount_products")}
              </h2>
            </div>

            <ProductSwiper products={discountProducts} variant="discount" />
          </div>
        )}

        {productGroups.map((group) => (
          <div key={group.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="title50 text-black lg:mb-0 lg:text-2xl">
                {group.name}
              </h2>

              <div className="ml-4 flex items-center gap-2">
                <span className="text30 inline-flex items-center rounded-full bg-gray20 px-2 py-0.5 text-blue30">
                  {t("view_all")} ({group.total})
                </span>
              </div>
            </div>

            <ProductSwiper products={group.products} />
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

const ProductSwiper = ({ products, variant }: ProductSwiperProps) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (currentSwiper: SwiperClass) => {
    setIsBeginning(currentSwiper.isBeginning);
    setIsEnd(currentSwiper.isEnd);
  };

  return (
    <div className="group relative overflow-visible max-lg:overflow-hidden">
      {!isBeginning && (
        <Button
          variant="swiperNav"
          size="swiperNav"
          aria-label="Oldingi mahsulotlar"
          onClick={() => swiper?.slidePrev()}
          className="absolute -left-12 top-[36%] z-20 hidden -translate-y-1/2 lg:flex"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </Button>
      )}

      <Swiper
        modules={[A11y, FreeMode]}
        spaceBetween={12}
        freeMode={{ enabled: true }}
        centeredSlides={false}
        onSwiper={(currentSwiper) => {
          setSwiper(currentSwiper);
          updateNavigation(currentSwiper);
        }}
        onSlideChange={updateNavigation}
        onReachBeginning={updateNavigation}
        onReachEnd={updateNavigation}
        onFromEdge={updateNavigation}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        className="overflow-hidden px-1 pb-5 pt-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="w-full pb-1">
              <CardProduct
                key={product.id}
                product={product}
                variant={variant}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {!isEnd && (
        <Button
          variant="swiperNav"
          size="swiperNav"
          aria-label="Keyingi mahsulotlar"
          onClick={() => swiper?.slideNext()}
          className="absolute -right-12 top-[36%] z-20 hidden -translate-y-1/2 lg:flex"
        >
          <ChevronRight size={18} strokeWidth={2.4} />
        </Button>
      )}
    </div>
  );
};

export default Products;
