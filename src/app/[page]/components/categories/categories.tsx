"use client";

import { getCategories } from "@/apis/categories";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { CategoriesSkeleton } from "@/components/ui/skleton";
import { useShopid } from "@/hooks/useShopId";
import type { CategoriesProps } from "@/types/categories";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import { normalizeCategories } from "@/utils/product";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { A11y, FreeMode } from "swiper/modules";
import type {
  DesktopCategoriesVariant,
  MobileCardVariant,
  MobileLayoutVariant,
  MobileSizeVariant,
} from "./types";




const getMobileLayoutVariant = (): MobileLayoutVariant => "scroll";
const getMobileCardVariant = (): MobileCardVariant => "image4Over";
const getMobileSizeVariant = (): MobileSizeVariant => "lg";
const getMobileGap = () => "sm";
const getDesktopVariant = (isFixed: boolean): DesktopCategoriesVariant =>
  isFixed ? "compact" : "pill";
const Categories = () => {
  const t = useTranslations();
  const router = useRouter();
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [isMobileFixed, setIsMobileFixed] = useState(false);
  const [isDesktopFixed, setIsDesktopFixed] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const desktopFixedTopRef = useRef<number | null>(null);
  const mobileFixedHeightRef = useRef<number | null>(null);
  const mobileListRef = useRef<HTMLDivElement | null>(null);
  const desktopListRef = useRef<HTMLDivElement | null>(null);
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const categories = normalizeCategories(data?.data);
  const resolvedMobileLayoutVariant = getMobileLayoutVariant();
  const resolvedMobileCardVariant = getMobileCardVariant();
  const isMobileScrollLayout = resolvedMobileLayoutVariant === "scroll";
  const isMobileFullLayout = resolvedMobileLayoutVariant === "full";
  const isDesktopSwiperLayout =
    isDesktopFixed || true;
  const effectiveDesktopVariant = getDesktopVariant(isDesktopFixed);
  const isDefaultDesktopVariant = effectiveDesktopVariant === "default";
  const mobileCategories =
    isMobileScrollLayout || isMobileFullLayout || showAllMobile || isMobileFixed
      ? categories
      : categories.slice(0, 5);
  const shouldShowActiveCategory = isMobileFixed || isDesktopFixed;
  const mobileGapClassName =
    {
      xs: "gap-1",
      sm: "gap-1.5",
      md: "gap-2",
      lg: "gap-3",
      xl: "gap-4",
      big: "gap-6",
    }[getMobileGap()] ?? "gap-2";

  const updateNavigation = (currentSwiper: SwiperClass) => {
    setIsBeginning(currentSwiper.isBeginning);
    setIsEnd(currentSwiper.isEnd);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      if (isDesktop && sectionRef.current && !isDesktopFixed) {
        desktopFixedTopRef.current = sectionRef.current.offsetTop;
      }

      // Kept fresh on every scroll tick (unlike desktopFixedTopRef's
      // offsetTop above, offsetHeight isn't corrupted by the section
      // already being `fixed`, so there's no need to freeze it before the
      // switch) — read by the mobile spacer below so the section leaving
      // document flow never changes the page's total height, which is what
      // caused the content to visibly jump on every fixed/relative toggle.
      if (!isDesktop && sectionRef.current) {
        mobileFixedHeightRef.current = sectionRef.current.offsetHeight;
      }

      setIsMobileFixed(!isDesktop && window.scrollY > 220);
      setIsDesktopFixed(
        isDesktop && window.scrollY >= (desktopFixedTopRef.current ?? 220),
      );

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-category-section]"),
      );
      const currentSection = sections
        .filter((section) => section.getBoundingClientRect().top <= 150)
        .at(-1);
      const currentId = currentSection?.dataset.categorySection;

      if (currentId) {
        setActiveCategoryId(Number(currentId));
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktopFixed]);

  useEffect(() => {
    if (!activeCategoryId || (!isMobileFixed && !isDesktopFixed)) return;

    const listRef = isDesktopFixed ? desktopListRef : mobileListRef;

    listRef.current
      ?.querySelector<HTMLElement>(`[data-category-chip="${activeCategoryId}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [activeCategoryId, isMobileFixed, isDesktopFixed]);

  // Once the bar is pinned (mobile or desktop), the homepage's own category
  // sections (data-category-section, tracked above) are already on screen,
  // so a tap should just smooth-scroll to that section instead of
  // navigating away. Before it's pinned, there's no section list to jump to
  // yet, so it opens that category's own page as before. Checking the
  // target element's actual presence (not just the pinned flag) is what
  // keeps this from trying to jump to a category section that hasn't
  // rendered/loaded yet — it falls back to navigating instead.
  const handleCategoryClick = (categoryId: number) => {
    if (isDesktopFixed || isMobileFixed) {
      const target = document.getElementById(`category-${categoryId}`);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    router.push(
      `${ROUTER.CATEGORY}/${categoryId}${shopid ? `?shop_id=${shopid}` : ""}`,
    );
  };

  if (isLoading) {
    return (
      <div className="hidden lg:block">
        <CategoriesSkeleton />
      </div>
    );
  }
  if (categories.length === 0) return null;

  const getMobileButtonClassName = (itemId: number, index: number) => {
    const isActive =
      shouldShowActiveCategory &&
      (activeCategoryId === itemId || (!activeCategoryId && index === 0));
    const activeClassName = isActive
      ? "!border-primary bg-primary10 font-bold text-primary"
      : "";
    const mobileInteractionClassName = "cursor-pointer";
    const fixedMobileCardVariant: MobileCardVariant =
      isMobileFixed && resolvedMobileCardVariant !== "text"
        ? "chip"
        : resolvedMobileCardVariant;
    const fixedMobileSizeVariant: MobileSizeVariant = isMobileFixed
      ? "md"
      : getMobileSizeVariant();
    const isCircleImageTopDefault =
      fixedMobileCardVariant === "circleImageTop" &&
      resolvedMobileLayoutVariant === "default";

    if (
      fixedMobileCardVariant === "imageTop" ||
      fixedMobileCardVariant === "circleImageTop" ||
      fixedMobileCardVariant === "imageOverlay" ||
      fixedMobileCardVariant === "image4Over"
    ) {
      if (
        fixedMobileCardVariant === "imageOverlay" ||
        fixedMobileCardVariant === "image4Over"
      ) {
        const sizeClassName =
          fixedMobileCardVariant === "image4Over"
            ? {
                mini: "h-12 w-12 text-[9px]",
                sm: "h-14 w-14 text-[10px]",
                md: "h-16 w-16 text-[11px]",
                lg: "h-[74px] w-[74px] text-xs",
                xl: "h-20 w-20 text-xs",
                big: "h-[88px] w-[88px] text-sm",
              }[fixedMobileSizeVariant] ?? "h-16 w-16 text-[11px]"
            : {
                mini: "h-12 w-20 text-[9px]",
                sm: "h-14 w-24 text-[10px]",
                md: "h-16 w-28 text-[11px]",
                lg: "h-[74px] w-32 text-xs",
                xl: "h-20 w-36 text-xs",
                big: "h-[88px] w-40 text-sm",
              }[fixedMobileSizeVariant] ?? "h-16 w-28 text-[11px]";

        return `relative flex shrink-0 items-end overflow-hidden rounded-xl border border-transparent bg-gray10 p-2 font-medium leading-tight text-white transition-all duration-300 active:scale-[0.98] ${mobileInteractionClassName} ${sizeClassName} ${activeClassName}`;
      }

      const sizeClassName =
        (isCircleImageTopDefault
          ? {
              mini: "w-[64px] gap-1 text-[9px]",
              sm: "w-[78px] gap-1.5 text-[10px]",
              md: "w-[92px] gap-2 text-[11px]",
              lg: "w-[106px] gap-2 text-xs",
              xl: "w-[120px] gap-2.5 text-sm",
              big: "w-[134px] gap-3 text-sm",
            }
          : {
              mini: "w-[58px] gap-1 text-[9px]",
              sm: "w-[70px] gap-1 text-[10px]",
              md: "w-[82px] gap-1.5 text-[11px]",
              lg: "w-[96px] gap-2 text-xs",
              xl: "w-[110px] gap-2 text-sm",
              big: "w-[124px] gap-2.5 text-sm",
            })[fixedMobileSizeVariant] ?? "w-[82px] gap-1.5 text-[11px]";

      return `flex shrink-0 flex-col items-center border border-transparent bg-transparent p-0 font-medium leading-tight text-black transition-all duration-300 active:scale-[0.98] ${
        fixedMobileCardVariant === "circleImageTop" && !isMobileFixed
          ? "cursor-default"
          : mobileInteractionClassName
      } ${sizeClassName} ${activeClassName}`;
    }

    if (fixedMobileCardVariant === "text") {
      const sizeClassName =
        {
          mini: "h-7 px-2.5 text-[9px]",
          sm: "h-8 px-3 text-[10px]",
          md: "h-9 px-3.5 text-[11px]",
          lg: "h-10 px-4 text-xs",
          xl: "h-11 px-5 text-sm",
          big: "h-12 px-6 text-sm",
        }[fixedMobileSizeVariant] ?? "h-9 px-3.5 text-[11px]";

      return `flex max-w-full shrink-0 items-center rounded-full border border-transparent bg-gray10 font-medium leading-none text-black transition-all duration-300 active:scale-[0.98] ${mobileInteractionClassName} ${sizeClassName} ${activeClassName}`;
    }

    const sizeClassName =
      (true
        ? {
            mini: "h-7 gap-1 py-0.5 pl-2 pr-0.5 text-[9px]",
            sm: "h-8 gap-1 py-1 pl-2.5 pr-1 text-[10px]",
            md: "h-9 gap-1 py-1 pl-2.5 pr-1 text-[11px]",
            lg: "h-11 gap-1.5 py-1.5 pl-3.5 pr-1.5 text-xs",
            xl: "h-12 gap-2 py-1.5 pl-4 pr-1.5 text-xs",
            big: "h-14 gap-2.5 py-2 pl-5 pr-2 text-sm",
          }
        : {
            mini: "h-7 gap-1 py-0.5 pl-0.5 pr-2 text-[9px]",
            sm: "h-8 gap-1 py-1 pl-1 pr-2.5 text-[10px]",
            md: "h-9 gap-1 py-1 pl-1 pr-2.5 text-[11px]",
            lg: "h-11 gap-1.5 py-1.5 pl-1.5 pr-3.5 text-xs",
            xl: "h-12 gap-2 py-1.5 pl-1.5 pr-4 text-xs",
            big: "h-14 gap-2.5 py-2 pl-2 pr-5 text-sm",
          })[fixedMobileSizeVariant] ??
      (true
        ? "h-9 gap-1 py-1 pl-2.5 pr-1 text-[11px]"
        : "h-9 gap-1 py-1 pl-1 pr-2.5 text-[11px]");

    return `flex max-w-full shrink-0 items-center justify-center ${
      fixedMobileCardVariant === "rectChip" ? "rounded-xl" : "rounded-full"
    } border border-transparent bg-gray10 font-medium leading-none text-black transition-all duration-300 active:scale-[0.98] ${mobileInteractionClassName} ${sizeClassName} ${activeClassName}`;
  };

  const getMobileImageClassName = () => {
    const fixedMobileCardVariant: MobileCardVariant =
      isMobileFixed && resolvedMobileCardVariant !== "text"
        ? "chip"
        : resolvedMobileCardVariant;
    const fixedMobileSizeVariant: MobileSizeVariant = isMobileFixed
      ? "md"
      : getMobileSizeVariant();
    const isCircleImageTopDefault =
      fixedMobileCardVariant === "circleImageTop" &&
      resolvedMobileLayoutVariant === "default";

    if (fixedMobileCardVariant === "circleImageTop") {
      return (
        (isCircleImageTopDefault
          ? {
              mini: "h-14 w-14 rounded-full border-2 border-gray180",
              sm: "h-16 w-16 rounded-full border-2 border-gray180",
              md: "h-[74px] w-[74px] rounded-full border-2 border-gray180",
              lg: "h-20 w-20 rounded-full border-2 border-gray180",
              xl: "h-[88px] w-[88px] rounded-full border-2 border-gray180",
              big: "h-24 w-24 rounded-full border-2 border-gray180",
            }
          : {
              mini: "h-12 w-12 rounded-full border-2 border-gray180",
              sm: "h-14 w-14 rounded-full border-2 border-gray180",
              md: "h-16 w-16 rounded-full border-2 border-gray180",
              lg: "h-[74px] w-[74px] rounded-full border-2 border-gray180",
              xl: "h-20 w-20 rounded-full border-2 border-gray180",
              big: "h-[88px] w-[88px] rounded-full border-2 border-gray180",
            })[fixedMobileSizeVariant] ??
        "h-[74px] w-[74px] rounded-full border-2 border-gray180"
      );
    }

    if (fixedMobileCardVariant === "imageTop") {
      return (
        {
          mini: "h-12 w-14 rounded-xl",
          sm: "h-14 w-16 rounded-xl",
          md: "h-16 w-[74px] rounded-xl",
          lg: "h-[74px] w-[88px] rounded-2xl",
          xl: "h-20 w-24 rounded-2xl",
          big: "h-[88px] w-[104px] rounded-2xl",
        }[fixedMobileSizeVariant] ?? "h-16 w-[74px] rounded-xl"
      );
    }

    if (
      fixedMobileCardVariant === "imageOverlay" ||
      fixedMobileCardVariant === "image4Over"
    ) {
      return "absolute inset-0 h-full w-full rounded-[10px]";
    }

    if (fixedMobileCardVariant === "rectChip") {
      return (
        {
          mini: "h-6 w-8 rounded",
          sm: "h-7 w-9 rounded-md",
          md: "h-8 w-10 rounded-md",
          lg: "h-9 w-12 rounded-lg",
          xl: "h-10 w-14 rounded-lg",
          big: "h-12 w-16 rounded-lg",
        }[fixedMobileSizeVariant] ?? "h-8 w-10 rounded-md"
      );
    }

    return (
      {
        mini: "h-4 w-4 rounded-full",
        sm: "h-5 w-5 rounded-full",
        md: "h-6 w-6 rounded-full",
        lg: "h-8 w-8 rounded-full",
        xl: "h-9 w-9 rounded-full",
        big: "h-10 w-10 rounded-full",
      }[fixedMobileSizeVariant] ?? "h-6 w-6 rounded-full"
    );
  };

  const renderMobileCategory = (item: CategoriesProps, index: number) => {
    const fixedMobileCardVariant: MobileCardVariant =
      isMobileFixed && resolvedMobileCardVariant !== "text"
        ? "chip"
        : resolvedMobileCardVariant;
    const shouldUseMobileRow =
      fixedMobileCardVariant === "chip" ||
      fixedMobileCardVariant === "rectChip";
    const imageOverlayTextAlignClassName =
      true
        ? "text-center "
        : false
          ? "text-left"
          : false
            ? "text-right"
            : false
              ? "text-right"
              : "text-left";
    const imageNode = fixedMobileCardVariant !== "text" && (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden ${
          fixedMobileCardVariant === "imageOverlay" ||
          fixedMobileCardVariant === "image4Over"
            ? "bg-gray10"
            : "bg-white"
        } ${getMobileImageClassName()}`}
      >
        <img
          src={getImageSrc(item.photo)}
          alt={item.name}
          onError={handleImageFallback}
          className={`h-full w-full object-cover ${
            fixedMobileCardVariant === "imageOverlay" ||
            fixedMobileCardVariant === "image4Over"
              ? "brightness-75"
              : ""
          }`}
        />
      </span>
    );
    const textNode = (
      <span
        className={
          fixedMobileCardVariant === "imageOverlay" ||
          fixedMobileCardVariant === "image4Over"
            ? `relative z-10 line-clamp-2 w-full ${imageOverlayTextAlignClassName}`
            : fixedMobileCardVariant === "imageTop" ||
                fixedMobileCardVariant === "circleImageTop"
              ? "line-clamp-2 text-center"
              : true && shouldUseMobileRow
                ? "truncate text-right"
                : "truncate"
        }
      >
        {item.name}
      </span>
    );

    return (
      <button
        key={item.id}
        type="button"
        data-category-chip={item.id}
        onClick={() => handleCategoryClick(item.id)}
        className={getMobileButtonClassName(item.id, index)}
      >
        {shouldUseMobileRow && true ? (
          <>
            {textNode}
            {imageNode}
          </>
        ) : (
          <>
            {imageNode}
            {textNode}
          </>
        )}
      </button>
    );
  };

  const renderDesktopCategory = (item: CategoriesProps, index: number) => {
    const isActive =
      shouldShowActiveCategory &&
      (activeCategoryId === item.id || (!activeCategoryId && index === 0));

    if (isDesktopFixed) {
      return (
        <button
          type="button"
          data-category-chip={item.id}
          onClick={() => handleCategoryClick(item.id)}
          className={`flex h-9 max-w-full shrink-0 items-center justify-center gap-1 rounded-full border border-transparent bg-gray10 py-1 pl-1 pr-2.5 text-[11px] font-medium leading-none text-black transition-all duration-300 active:scale-[0.98] ${
            isActive ? "border-black! bg-gray180 font-bold text-black" : ""
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
            <img
              src={getImageSrc(item.photo)}
              alt={item.name}
              onError={handleImageFallback}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="truncate">{item.name}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        data-category-chip={item.id}
        onClick={() => handleCategoryClick(item.id)}
        className={`relative flex size-18.5 shrink-0 items-end overflow-hidden rounded-xl border border-transparent bg-gray10 p-2 text-left text-xs font-medium leading-tight text-white transition-colors duration-300 active:scale-[0.98] lg:size-24 lg:rounded-2xl lg:p-2.5 lg:text-sm ${
          isActive ? "border-white ring-2 ring-white" : ""
        }`}
      >
        <img
          src={getImageSrc(item.photo)}
          alt={item.name}
          onError={handleImageFallback}
          className="absolute inset-0 h-full w-full object-cover brightness-75"
        />
        <span className="relative z-10 line-clamp-2 w-full text-center drop-shadow-sm">
          {item.name}
        </span>
      </button>
    );
  };
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
                aria-label={t("home.close_categories")}
              >
                <ChevronUp size={17} strokeWidth={2.4} />
              </button>
            )}
        </div>

        <div
          ref={desktopListRef}
          className="scroll-hidden relative hidden w-full max-w-7xl overflow-visible lg:block"
        >
          {isDesktopSwiperLayout && !isBeginning && (
            <Button
              variant="swiperNav"
              size="swiperNav"
              aria-label={t("home.prev_categories")}
              onClick={() => swiper?.slidePrev()}
              className="absolute -left-12 top-[38%] z-20 hidden -translate-y-1/2 lg:flex"
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
            </Button>
          )}

          {isDesktopSwiperLayout ? (
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
          ) : (
            <div className="flex flex-wrap items-center justify-start gap-3 pb-1">
              {categories.map((item: CategoriesProps, index) => (
                <div key={item.id}>{renderDesktopCategory(item, index)}</div>
              ))}
            </div>
          )}

          {isDesktopSwiperLayout && !isEnd && (
            <Button
              variant="swiperNav"
              size="swiperNav"
              aria-label={t("home.next_categories")}
              onClick={() => swiper?.slideNext()}
              className="absolute -right-12 top-[38%] z-20 hidden -translate-y-1/2 lg:flex"
            >
              <ChevronRight size={18} strokeWidth={2.4} />
            </Button>
          )}
        </div>
      </section>
      {/* Keeps the page's total height unchanged the instant the section
          above leaves document flow for `fixed` — without it, everything
          below snapped up by the bar's height for a frame on every
          fixed/relative toggle (the reported jump/glitch). */}
      {isMobileFixed && (
        <div
          className="lg:hidden"
          style={{ height: mobileFixedHeightRef.current ?? 0 }}
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

export default Categories;







