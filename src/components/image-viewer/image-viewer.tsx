"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { IconPlayerPlayFilled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getImageSrc, handleImageFallback } from "@/utils/image";

type ImageViewerProps = {
  images: string[];
  // Index of the image to show; null = closed.
  openIndex: number | null;
  onClose: () => void;
};

const SWIPE_THRESHOLD = 50;

// Items are image URLs by default; a video file URL (e.g. the atmosphere
// page's hero clip) is played in place of an <img>.
const isVideoSrc = (src: string) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src);

// Fullscreen image viewer (black backdrop, "n/total" counter, close button,
// swipe/arrows between images). Built on the Radix Dialog so it stacks
// correctly above other Radix Sheets/Dialogs (e.g. the product detail
// drawer) without closing them.
const ImageViewer = ({ images, openIndex, onClose }: ImageViewerProps) => {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const [prevOpenIndex, setPrevOpenIndex] = useState(openIndex);
  const touchStartX = useRef<number | null>(null);

  // Sync the shown image with each new open (adjust-state-during-render).
  if (openIndex !== prevOpenIndex) {
    setPrevOpenIndex(openIndex);
    if (openIndex !== null) setIndex(openIndex);
  }

  const total = images.length;
  const hasMany = total > 1;
  const goTo = (next: number) => setIndex((next + total) % total);

  return (
    <Dialog
      open={openIndex !== null && total > 0}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onKeyDown={(event) => {
          if (!hasMany) return;
          if (event.key === "ArrowLeft") goTo(index - 1);
          if (event.key === "ArrowRight") goTo(index + 1);
        }}
        className="left-0 top-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black p-0 ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{t("shared_image_viewer")}</DialogTitle>

        <div className="flex shrink-0 items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 text-white">
          <span className="text-sm font-medium">
            {index + 1}/{total}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common_close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Mobile: thumbnails in a row under the image. Desktop: a narrow
            column of small thumbnails on the right, so the image keeps the
            full height. */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center lg:px-6 lg:pb-6"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const startX = touchStartX.current;
            const endX = event.changedTouches[0]?.clientX;

            touchStartX.current = null;
            if (!hasMany || startX === null || endX === undefined) return;

            const delta = endX - startX;

            if (delta > SWIPE_THRESHOLD) goTo(index - 1);
            if (delta < -SWIPE_THRESHOLD) goTo(index + 1);
          }}
        >
          {images[index] &&
            (isVideoSrc(images[index]) ? (
              <video
                key={images[index]}
                src={images[index]}
                autoPlay
                controls
                loop
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={getImageSrc(images[index])}
                onError={handleImageFallback}
                alt=""
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
              />
            ))}

          {hasMany && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label={t("common_back")}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label={t("common_continue")}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {hasMany && (
          <div className="scroll-hidden flex shrink-0 gap-2 overflow-x-auto px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] lg:w-28 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pl-0 lg:pr-5 lg:pt-0 lg:pb-6">
            {images.map((image, imageIndex) => (
              <button
                key={`${image}-${imageIndex}`}
                type="button"
                onClick={() => setIndex(imageIndex)}
                ref={(node) => {
                  if (node && imageIndex === index) {
                    node.scrollIntoView({ block: "nearest", inline: "center" });
                  }
                }}
                // Mobile: exactly 6 per row, (width − 5 gaps of 0.5rem) / 6.
                // Desktop: the full width of the thumbnail column.
                className={`relative aspect-square w-[calc((100%-2.5rem)/6)] shrink-0 lg:w-full overflow-hidden rounded-xl border-2 transition-opacity ${
                  imageIndex === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-50"
                }`}
              >
                {isVideoSrc(image) ? (
                  <>
                    <video
                      src={image}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                      <IconPlayerPlayFilled size={16} fill="currentColor" />
                    </span>
                  </>
                ) : (
                  <img
                    src={getImageSrc(image)}
                    onError={handleImageFallback}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                )}
              </button>
            ))}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
