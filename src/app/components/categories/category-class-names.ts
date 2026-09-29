
import "swiper/css";
import type { MobileCardVariant, MobileSizeVariant } from "./types";
import {
  getMobileCardVariant,
  getMobileLayoutVariant,
  getMobileSizeVariant,
} from "./variants";

type MobileClassNamesContext = {
  isMobileFixed: boolean;
  activeCategoryId: number | null;
  shouldShowActiveCategory: boolean;
};

// Class-name builders for the mobile category tiles, for the current
// fixed/active state.
export const createMobileClassNames = ({
  isMobileFixed,
  activeCategoryId,
  shouldShowActiveCategory,
}: MobileClassNamesContext) => {
  const resolvedMobileLayoutVariant = getMobileLayoutVariant();
  const resolvedMobileCardVariant = getMobileCardVariant();

  const getMobileButtonClassName = (itemId: number, index: number) => {
    const isActive =
      shouldShowActiveCategory &&
      (activeCategoryId === itemId || (!activeCategoryId && index === 0));
    const activeClassName = isActive
      ? "!border-primary bg-primary10 font-medium text-primary"
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

  return { getMobileButtonClassName, getMobileImageClassName };
};
