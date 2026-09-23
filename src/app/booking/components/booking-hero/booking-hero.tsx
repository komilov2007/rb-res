"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { galleryImages } from "@/constants/atmosphere";

// Cover is one of /atmosphere's own gallery photos, so the hero previews
// exactly what tapping it opens (/atmosphere, the restaurant's gallery).
const BookingHero = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();

  return (
    <button
      type="button"
      onClick={() =>
        router.push(`${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`)
      }
      className="relative block h-56 w-full overflow-hidden rounded-xl bg-black text-left lg:h-80"
    >
      <img
        src={galleryImages[0].src}
        alt=""
        className="h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />
      <span className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-white/20 py-1 pl-3 pr-2 text-xs font-medium text-white backdrop-blur-md">
        {t("atmosphere_title")}
        <ChevronRight size={14} />
      </span>
      <div className="absolute inset-x-4 bottom-4 text-white">
        <span className="mb-2 block h-1 w-8 rounded-full bg-white" />
        <h2 className="text-lg font-medium leading-6">
          {t("booking_form_title")}
        </h2>
      </div>
    </button>
  );
};

export default BookingHero;
