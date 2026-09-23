"use client";

import { ChevronRight } from "lucide-react";
import { IconHomeFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

// Desktop-only breadcrumb bar under the site Header — same full-bleed
// white bar as the categories page; mobile floats a back button instead.
const AtmosphereBreadcrumb = () => {
  const t = useTranslations();
  const { shopid } = useShopId();

  return (
    <div className="hidden w-full border-b border-gray180 bg-white lg:block">
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 px-5 py-4 text-xs text-gray220">
        <Link
          href={`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`}
          className="flex items-center gap-1.5 font-medium hover:text-black"
        >
          <IconHomeFilled size={14} />
          {t("catalog_home")}
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-black">{t("atmosphere_title")}</span>
      </nav>
    </div>
  );
};

export default AtmosphereBreadcrumb;
