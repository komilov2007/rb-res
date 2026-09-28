import { galleryImages, menuImages } from "@/constants/atmosphere";

export const ATMOSPHERE_VIDEO_SRC = "/atmosfera.mp4";

// What the full-screen viewer pages through: the hero video first, then
// the gallery photos — so the photo at grid index i is viewer index i + 1 —
// then the desktop "Menyu" photos, from MENU_MEDIA_OFFSET on.
export const ATMOSPHERE_MEDIA = [
  ATMOSPHERE_VIDEO_SRC,
  ...galleryImages.map((image) => image.src),
  ...menuImages.map((image) => image.src),
];

export const MENU_MEDIA_OFFSET = 1 + galleryImages.length;

// Mobile layout variants, picked by whoever renders <Atmosphere /> (page.tsx).
export type AtmosphereVariant = "one" | "two" | "three" | "four";

// Every variant gets the same single callback: open the shared full-screen
// viewer at ATMOSPHERE_MEDIA[index].
export type AtmosphereVariantProps = {
  onOpen: (index: number) => void;
};
