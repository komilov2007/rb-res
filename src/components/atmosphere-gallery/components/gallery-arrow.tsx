import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/ui/button";

type GalleryArrowProps = {
  direction: "left" | "right";
  className: string;
  onClick: () => void;
};

const GalleryArrow = ({
  direction,
  className,
  onClick,
}: GalleryArrowProps) => {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <Button
      type="button"
      variant="plain"
      size="none"
      onClick={onClick}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 lg:grid ${className}`}
    >
      <Icon size={22} />
    </Button>
  );
};

export default GalleryArrow;
