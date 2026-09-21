"use client";

import { ChevronLeft, Images } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { galleryImages } from "@/constants/atmosphere";

// A photo from /atmosphere, nothing written over it — only two frosted
// buttons: back, and "Atmosfera" (which, like the photo, opens /atmosphere).
const TwoHero = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();

  const openAtmosphere = () =>
    router.push(`${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`);

  return (
    <div className="relative h-64 overflow-hidden rounded-b-2xl bg-gray10">
      <button
        type="button"
        onClick={openAtmosphere}
        aria-label={t("atmosphere_title")}
        className="block h-full w-full"
      >
        <img
          src={galleryImages[1].src}
          alt=""
          className="h-full w-full object-cover"
        />
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        aria-label={t("common_back")}
        className="absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={openAtmosphere}
        aria-label={t("atmosphere_title")}
        className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 items-center gap-1.5 rounded-full bg-black/30 pl-3 pr-4 text-sm font-medium text-white backdrop-blur-md"
      >
        <Images size={16} />
        {t("atmosphere_title")}
      </button>
    </div>
  );
};

export default TwoHero;
