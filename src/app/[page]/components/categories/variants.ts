import type {
  DesktopCategoriesVariant,
  MobileCardVariant,
  MobileLayoutVariant,
  MobileSizeVariant,
} from "./types";

export const getMobileLayoutVariant = (): MobileLayoutVariant => "scroll";
export const getMobileCardVariant = (): MobileCardVariant => "image4Over";
export const getMobileSizeVariant = (): MobileSizeVariant => "lg";
export const getMobileGap = () => "sm";
export const getDesktopVariant = (isFixed: boolean): DesktopCategoriesVariant =>
  isFixed ? "compact" : "pill";
