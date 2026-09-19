import type { SyntheticEvent } from "react";

export const IMAGE_PLACEHOLDER_SRC = "/image-placeholder.svg";

export const handleImageFallback = (
  event: SyntheticEvent<HTMLImageElement>,
) => {
  const image = event.currentTarget;

  image.onerror = null;
  image.src = IMAGE_PLACEHOLDER_SRC;
};
