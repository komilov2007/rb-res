import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { galleryImages } from "@/constants/atmosphere";

type GalleryModalProps = {
  activeImage: string | null;
  onClose: () => void;
  onSelect: (image: string) => void;
};

const GalleryModal = ({
  activeImage,
  onClose,
  onSelect,
}: GalleryModalProps) => {
  const t = useTranslations();
  const total = galleryImages.length;
  const hasMany = total > 1;
  const activeIndex = galleryImages.findIndex(
    (image) => image.src === activeImage,
  );
  const goTo = (next: number) =>
    onSelect(galleryImages[(next + total) % total].src);

  return (
    <Dialog
      open={Boolean(activeImage)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        showCloseButton={false}
        className="h-[88dvh] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border-0 bg-black p-0 lg:grid lg:max-w-[1180px] lg:grid-cols-[1fr_260px]"
      >
        <div className="relative flex min-h-0 items-center justify-center bg-black">
          {activeImage && (
            <img
              src={activeImage}
              alt={t("booking_gallery_image_alt")}
              className="max-h-full w-full object-contain"
            />
          )}
          {hasMany && (
            <>
              <Button
                type="button"
                variant="plain"
                size="none"
                onClick={() => goTo(activeIndex - 1)}
                aria-label={t("common_back")}
                className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/45 text-white backdrop-blur-md"
              >
                <ChevronLeft size={22} />
              </Button>
              <Button
                type="button"
                variant="plain"
                size="none"
                onClick={() => goTo(activeIndex + 1)}
                aria-label={t("common_continue")}
                className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/45 text-white backdrop-blur-md"
              >
                <ChevronRight size={22} />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={onClose}
            className="absolute right-4 top-4 h-10 w-10 rounded-full bg-black/45 text-white backdrop-blur-md hover:text-gray220"
          >
            <X size={22} />
          </Button>
        </div>

        <div className="gallery-thumbs flex gap-3 overflow-x-auto bg-black/95 p-3 lg:h-full lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {galleryImages.map((image) => {
            const isActive = activeImage === image.src;

            return (
              <button
                key={image.src}
                type="button"
                onClick={() => onSelect(image.src)}
                className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 lg:h-24 lg:w-full ${
                  isActive ? "border-primary" : "border-white/10 opacity-65"
                }`}
              >
                <img
                  src={image.src}
                  alt={t("booking_gallery_image_alt")}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
