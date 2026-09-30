"use client";

import Link from "next/link";
import { IconLayoutGrid, IconToolsKitchen2Off } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

// Empty category: icon + title + hint, with a way back to all categories.
const EmptyCategory = () => {
  const t = useTranslations();
  const { shopid } = useShopId();

  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary10">
        <IconToolsKitchen2Off size={36} className="text-primary" />
      </div>

      <p className="mt-4 text-base font-medium text-black">
        {t("catalog_empty_category")}
      </p>
      <p className="mt-1 max-w-xs text-sm font-normal text-gray220">
        {t("catalog_empty_category_hint")}
      </p>

      <Button asChild variant="primary-solid" size="primaryFit" className="mt-5 gap-2">
        <Link
          href={`${ROUTER.CATEGORIES}${shopid ? `?shop_id=${shopid}` : ""}`}
          className="text-white!"
        >
          <IconLayoutGrid size={18} />
          {t("catalog_all_categories")}
        </Link>
      </Button>
    </div>
  );
};

export default EmptyCategory;
