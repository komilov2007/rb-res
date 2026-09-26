"use client";

import type { CategoriesProps } from "@/types/categories";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import type { MobileCardVariant } from "./types";
import { getMobileCardVariant } from "./variants";
import { createMobileClassNames } from "./category-class-names";

type CategoryRenderersContext = {
  isMobileFixed: boolean;
  isDesktopFixed: boolean;
  activeCategoryId: number | null;
  shouldShowActiveCategory: boolean;
  handleCategoryClick: (categoryId: number) => void;
};

// Mobile tile and desktop chip renderers for one category, for the
// current fixed/active state.
export const createCategoryRenderers = ({
  isMobileFixed,
  isDesktopFixed,
  activeCategoryId,
  shouldShowActiveCategory,
  handleCategoryClick,
}: CategoryRenderersContext) => {
  const { getMobileButtonClassName, getMobileImageClassName } =
    createMobileClassNames({
      isMobileFixed,
      activeCategoryId,
      shouldShowActiveCategory,
    });
  const resolvedMobileCardVariant = getMobileCardVariant();

  const renderMobileCategory = (item: CategoriesProps, index: number) => {
    const fixedMobileCardVariant: MobileCardVariant =
      isMobileFixed && resolvedMobileCardVariant !== "text"
        ? "chip"
        : resolvedMobileCardVariant;
    const shouldUseMobileRow =
      fixedMobileCardVariant === "chip" ||
      fixedMobileCardVariant === "rectChip";
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
            ? "relative z-10 line-clamp-2 w-full text-center"
            : fixedMobileCardVariant === "imageTop" ||
                fixedMobileCardVariant === "circleImageTop"
              ? "line-clamp-2 text-center"
              : shouldUseMobileRow
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
        {shouldUseMobileRow ? (
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
            isActive ? "border-primary! bg-gray180 font-medium text-black" : ""
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

  return { renderMobileCategory, renderDesktopCategory };
};
