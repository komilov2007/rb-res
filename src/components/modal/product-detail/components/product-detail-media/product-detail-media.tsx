import { useState } from "react";

import ImageViewer from "@/components/image-viewer";
import { getImageSrc, handleImageFallback } from "@/utils/image";

type ProductDetailMediaProps = {
  image: string;
  name: string;
  photos: string[];
  activePhotoIndex: number;
  hasDiscount: boolean;
  saleLabel: string;
  saleBadgeClassName: string;
  onSelectPhoto: (index: number) => void;
};

const ProductDetailMedia = ({
  image,
  name,
  photos,
  activePhotoIndex,
  hasDiscount,
  saleLabel,
  saleBadgeClassName,
  onSelectPhoto,
}: ProductDetailMediaProps) => {
  // Tapping the main photo opens it fullscreen (all photos, swipeable).
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerImages = photos.length > 0 ? photos : [image];

  return (
    <>
      {/* Fixed height + object-cover (not object-contain sized to the
          image's own aspect ratio) so a narrow/tall product photo fills the
          frame edge to edge instead of leaving visible white bars down the
          sides — a slight crop is preferred over that empty margin. */}
      <div className="relative h-[45dvh] overflow-hidden rounded-[24px] bg-white lg:h-105 lg:rounded-none">
        <img
          src={getImageSrc(image)}
          alt={name}
          onError={handleImageFallback}
          onClick={() =>
            setViewerIndex(photos.length > 0 ? activePhotoIndex : 0)
          }
          className="h-full w-full cursor-zoom-in object-cover"
        />
        {hasDiscount && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-medium leading-none text-white ${saleBadgeClassName}`}
          >
            {saleLabel}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="scroll-hidden mt-3 flex gap-2 overflow-x-auto px-5 lg:mt-4 lg:px-6">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => onSelectPhoto(index)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 bg-gray10 transition-colors lg:h-16 lg:w-16 ${
                activePhotoIndex === index
                  ? "border-primary"
                  : "border-transparent"
              }`}
            >
              <img
                src={getImageSrc(photo)}
                alt={`${name} ${index + 1}`}
                onError={handleImageFallback}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <ImageViewer
        images={viewerImages}
        openIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
};

export default ProductDetailMedia;



