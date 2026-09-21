import { galleryImages } from "@/constants/atmosphere";

export const ATMOSPHERE_VIDEO_SRC = "/atmosfera.mp4";

// What the full-screen viewer pages through: the hero video first, then
// the gallery photos — so the photo at grid index i is viewer index i + 1.
export const ATMOSPHERE_MEDIA = [
  ATMOSPHERE_VIDEO_SRC,
  ...galleryImages.map((image) => image.src),
];

// Mobile layout variants, picked by whoever renders <Atmosphere /> (page.tsx).
export type AtmosphereVariant = "one" | "two" | "three" | "four";

// Every variant gets the same single callback: open the shared full-screen
// viewer at ATMOSPHERE_MEDIA[index].
export type AtmosphereVariantProps = {
  onOpen: (index: number) => void;
};
