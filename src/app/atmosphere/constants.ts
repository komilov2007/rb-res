import { galleryImages, menuImages } from "@/constants/atmosphere";

export const ATMOSPHERE_VIDEO_SRC = "/atmosfera.mp4";

export const ATMOSPHERE_MEDIA = [
  ATMOSPHERE_VIDEO_SRC,
  ...galleryImages.map((image) => image.src),
  ...menuImages.map((image) => image.src),
];

export const MENU_MEDIA_OFFSET = 1 + galleryImages.length;

export type AtmosphereVariant = "one" | "two" | "three" | "four";

export type AtmosphereVariantProps = {
  onOpen: (index: number) => void;
};
