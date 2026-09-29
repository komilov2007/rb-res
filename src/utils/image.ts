import type { SyntheticEvent } from "react";

export const IMAGE_PLACEHOLDER_SRC = "/image-placeholder.svg";

// API can return null/empty photo fields — render the placeholder instead of a
// broken <img> (an empty src also makes the browser re-request the page URL).
export const getImageSrc = (
  ...sources: (string | null | undefined)[]
): string => {
  for (const source of sources) {
    if (typeof source === "string" && source.trim() !== "") return source;
  }

  return IMAGE_PLACEHOLDER_SRC;
};

export const handleImageFallback = (
  event: SyntheticEvent<HTMLImageElement>,
) => {
  const image = event.currentTarget;

  image.onerror = null;
  image.src = IMAGE_PLACEHOLDER_SRC;
};
