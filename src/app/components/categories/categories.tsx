"use client";

import Button from "@/components/ui/button";
import { CategoriesSkeleton } from "@/components/ui/skeleton";
import type { CategoriesProps } from "@/types/categories";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode } from "swiper/modules";
import { createCategoryRenderers } from "./category-renderers";
import { useCategories } from "./useCategories";
import "swiper/css";

const Categories = () => {
  const t = useTranslations();
  const {
    swiper,
    setSwiper,
    isBeginning,
    isEnd,
    showAllMobile,
    setShowAllMobile,
    isMobileFixed,
    isDesktopFixed,
    activeCategoryId,
    sectionRef,
    mobileFixedHeight,
    mobileListRef,
    desktopListRef,
    isLoading,
    categories,
    resolvedMobileLayoutVariant,
    isMobileScrollLayout,
    isDefaultDesktopVariant,
    mobileCategories,
    shouldShowActiveCategory,
    mobileGapClassName,
    updateNavigation,
    handleCategoryClick,
  } = useCategories();

  if (isLoading) {
    return (
      <div className="hidden lg:block">
        <CategoriesSkeleton />
      </div>
    );
  }
  if (categories.length === 0) return null;

  const { renderMobileCategory, renderDesktopCategory } =
    createCategoryRenderers({
      isMobileFixed,
      isDesktopFixed,
      activeCategoryId,
      shouldShowActiveCategory,
      handleCategoryClick,
    });

  return (
    <>
      <section
        ref={sectionRef}
        id="categories"
        className={`z-40 w-full overflow-x-hidden rounded-b-[20px] bg-white px-4 pb-4 pt-1 transition-all duration-300 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:overflow-visible lg:rounded-b-[22px] lg:pt-3 ${
          isMobileFixed
            ? "fixed left-0 top-16 shadow-[0_12px_28px_rgba(17,24,39,0.08)]"
            : "relative shadow-none"
        } ${
          isDesktopFixed
            ? "lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:shadow-[0_12px_28px_rgba(17,24,39,0.08)]"
            : "lg:relative lg:shadow-none"
        }`}
      >
        <div
          ref={mobileListRef}
          className={`scroll-hidden flex ${mobileGapClassName} lg:hidden ${
            isMobileFixed || isMobileScrollLayout
              ? "flex-nowrap overflow-x-auto"
              : "flex-wrap"
          }`}
        >
          {mobileCategories.map((item: CategoriesProps, index) =>
            renderMobileCategory(item, index),
          )}

          {resolvedMobileLayoutVariant === "default" &&
            !showAllMobile &&
            !isMobileFixed &&
            categories.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllMobile(true)}
                className="flex h-9 items-center justify-center rounded-full bg-gray10 px-3 text-xs font-medium leading-none text-black"
              >
                +{categories.length - 5}
              </button>
            )}

          {resolvedMobileLayoutVariant === "default" &&
            showAllMobile &&
            !isMobileFixed &&
            categories.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllMobile(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray10 text-black"
                aria-label={t("home_close_categories")}
              >
                <ChevronUp size={17} strokeWidth={2.4} />
              </button>
            )}
        </div>

        <div
          ref={desktopListRef}
          className="scroll-hidden relative hidden w-full max-w-7xl overflow-visible lg:block"
        >
          {!isBeginning && (
            <Button
              variant="swiperNav"
              size="swiperNav"
              aria-label={t("home_prev_categories")}
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
            slidesPerView={isDefaultDesktopVariant ? 9 : "auto"}
            breakpoints={
              isDefaultDesktopVariant
                ? {
                    320: { slidesPerView: 4 },
                    480: { slidesPerView: 5 },
                    900: { slidesPerView: 7 },
                    1024: { slidesPerView: 9 },
                  }
                : undefined
            }
            className="pb-1"
          >
            {categories.map((item: CategoriesProps, index) => (
              <SwiperSlide
                key={item.id}
                className={isDefaultDesktopVariant ? undefined : "!w-auto"}
              >
                {renderDesktopCategory(item, index)}
              </SwiperSlide>
            ))}
          </Swiper>

          {!isEnd && (
            <Button
              variant="swiperNav"
              size="swiperNav"
              aria-label={t("home_next_categories")}
              onClick={() => swiper?.slideNext()}
              className="absolute -right-12 top-[38%] z-20 hidden -translate-y-1/2 lg:flex"
            >
              <ChevronRight size={18} strokeWidth={2.4} />
            </Button>
          )}
        </div>
      </section>
      {isMobileFixed && (
        <div
          className="lg:hidden"
          style={{ height: mobileFixedHeight ?? 0 }}
        />
      )}
      {isDesktopFixed && (
        <div
          className={`hidden lg:block ${
            isDefaultDesktopVariant ? "h-[142px]" : "h-[60px]"
          }`}
        />
      )}
    </>
  );
};

export type MobileCardVariant =
  | "text"
  | "chip"
  | "rectChip"
  | "imageTop"
  | "circleImageTop"
  | "imageOverlay"
  | "image4Over";

export type MobileSizeVariant = "mini" | "sm" | "md" | "lg" | "xl" | "big";
export type MobileLayoutVariant = "default" | "full" | "scroll";
export type DesktopCategoriesVariant =
  | "default"
  | "pill"
  | "notpill"
  | "bigcategory"
  | "compact";

export const getMobileLayoutVariant = (): MobileLayoutVariant => "scroll";
export const getMobileCardVariant = (): MobileCardVariant => "image4Over";
export const getMobileSizeVariant = (): MobileSizeVariant => "lg";
export const getMobileGap = () => "sm";
export const getDesktopVariant = (isFixed: boolean): DesktopCategoriesVariant =>
  isFixed ? "compact" : "pill";

export { Categories };

export default Categories;
