"use client";

import { useState } from "react";
import { A11y, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Swiper as SwiperClass } from "swiper";

import CardProduct from "@/components/card-product";
import Button from "@/components/ui/button";
import type { ProductProps } from "@/types/product";
import type { DiscountProductVariant, SaleBadgeVariant } from "../../types";

import { PRODUCT_SWIPER_BREAKPOINTS } from "../../constants";

type ProductSwiperProps = {
  products: ProductProps[];
  variant?: DiscountProductVariant;
  saleBadgeVariant?: SaleBadgeVariant;
  // Selected home branch — products not sold there are shown muted.
  branchId?: number | null;
};

const ProductSwiper = ({
  products,
  variant,
  saleBadgeVariant = "red",
  branchId = null,
}: ProductSwiperProps) => {
  const t = useTranslations();
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const isUnavailable = (product: ProductProps) =>
    branchId !== null && !product.branches?.includes(branchId);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const bottomPaddingClassName = variant ? "pb-0" : "pb-8";

  const updateNavigation = (currentSwiper: SwiperClass) => {
    setIsBeginning(currentSwiper.isBeginning);
    setIsEnd(currentSwiper.isEnd);
  };

  return (
    <div className="scroll-hidden relative overflow-visible">
      <div
        className={`grid grid-cols-2 gap-1.75 lg:hidden ${bottomPaddingClassName}`}
      >
        {products.map((product) => (
          <CardProduct
            key={product.id}
            product={product}
            variant={variant}
            saleBadgeVariant={saleBadgeVariant}
            isUnavailable={isUnavailable(product)}
          />
        ))}
      </div>

      {!isBeginning && (
        <Button
          variant="swiperNav"
          size="swiperNav"
          aria-label={t("home.prev_products")}
          onClick={() => swiper?.slidePrev()}
          className="absolute -left-12 top-[36%] z-20 hidden -translate-y-1/2 lg:flex"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </Button>
      )}

      <div className="-mx-4 hidden overflow-hidden px-4 lg:block">
        <Swiper
          modules={[A11y, FreeMode]}
          slidesPerView={2}
          spaceBetween={18}
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
          breakpoints={PRODUCT_SWIPER_BREAKPOINTS}
          className={`scroll-hidden px-1 pt-3 lg:px-2 ${bottomPaddingClassName}`}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="w-full py-1">
                <CardProduct
                  product={product}
                  variant={variant}
                  saleBadgeVariant={saleBadgeVariant}
                  isUnavailable={isUnavailable(product)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {!isEnd && (
        <Button
          variant="swiperNav"
          size="swiperNav"
          aria-label={t("home.next_products")}
          onClick={() => swiper?.slideNext()}
          className="absolute -right-12 top-[36%] z-20 hidden -translate-y-1/2 lg:flex"
        >
          <ChevronRight size={18} strokeWidth={2.4} />
        </Button>
      )}
    </div>
  );
};

export default ProductSwiper;
