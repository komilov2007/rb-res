import { CATEGORY_BANNER_IMAGE } from "../../constants";

type CategoryBannerProps = {
  title: string;
  imageSrc?: string;
  videoSrc?: string;
  variant?: "default" | "discount";
  sizeVariant?: "mini" | "sm" | "md" | "lg" | "xl" | "big";
};

const CategoryBanner = ({
  title,
  imageSrc,
  videoSrc,
  variant = "default",
  sizeVariant = "md",
}: CategoryBannerProps) => {
  const bannerImage = imageSrc ?? CATEGORY_BANNER_IMAGE;
  const isDiscount = variant === "discount";
  const heightClassName =
    {
      mini: "h-[180px]",
      sm: "h-[220px]",
      md: "h-[280px]",
      lg: "h-[340px]",
      xl: "h-[400px]",
      big: "h-[480px]",
    }[sizeVariant] ?? "h-[280px]";

  return (
    <div className="surface-banner-shadow relative -mx-4 w-screen overflow-hidden rounded-t-[28px] bg-white pb-0 ring-1 ring-black/5 lg:mx-0 lg:w-full lg:rounded-t-[34px]">
      <div
        className={`block w-full overflow-hidden bg-gray20 ${
          isDiscount
            ? "h-[220px] lg:h-auto lg:aspect-[1280/360]"
            : `lg:h-auto lg:aspect-[1280/400] ${heightClassName}`
        }`}
      >
        {videoSrc ? (
          <video
            className="h-full w-full border border-b-white object-cover"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            className="h-full w-full border border-b-white object-cover"
            src={bannerImage}
            alt={title}
            loading="lazy"
          />
        )}
      </div>

      <h2 className="title50 absolute left-5 top-5 z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] lg:left-8 lg:top-7 lg:text-2xl">
        {title}
      </h2>

      {isDiscount ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-9 bg-white" />
      ) : (
        <div
          className="
      pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20
      bg-gradient-to-b from-transparent via-white/10 to-white/95
      shadow-[inset_0_-1px_18px_-72px_rgba(0,0,0,0.98)]
      lg:h-24
    "
        />
      )}
    </div>
  );
};

export default CategoryBanner;

