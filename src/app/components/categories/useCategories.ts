"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { normalizeCategories } from "@/utils/product";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import {
  getDesktopVariant,
  getMobileGap,
  getMobileLayoutVariant,
} from "./variants";

// Category bar state: the category list, the fixed-on-scroll modes with
// the active section tracking, swiper navigation, and tap handling.
export const useCategories = () => {
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
  // Height the section had while still in document flow — the mobile
  // spacer below reserves exactly that much once the section turns fixed.
  const [mobileFixedHeight, setMobileFixedHeight] = useState<number | null>(
    null,
  );
  const mobileListRef = useRef<HTMLDivElement | null>(null);
  const desktopListRef = useRef<HTMLDivElement | null>(null);
  const { shopid } = useShopId();
  const { data, isLoading } = useShopCategories();

  const categories = normalizeCategories(data?.data);
  const resolvedMobileLayoutVariant = getMobileLayoutVariant();
  const isMobileScrollLayout = resolvedMobileLayoutVariant === "scroll";
  const isMobileFullLayout = resolvedMobileLayoutVariant === "full";
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

      // Measured only while the section is still in document flow: once it
      // is `fixed` it renders compact chips, so its height shrinks, and the
      // spacer must keep the in-flow height — otherwise the page's total
      // height changes on the fixed/relative toggle and the content jumps.
      if (
        !isDesktop &&
        sectionRef.current &&
        getComputedStyle(sectionRef.current).position !== "fixed"
      ) {
        setMobileFixedHeight(sectionRef.current.offsetHeight);
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

  return {
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
  };
};
