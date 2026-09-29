"use client";

import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

const EmptyOrders = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <PackageSearch size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-medium text-black">
        {t("orders_empty_title")}
      </h3>
      <p className="mt-2 max-w-70 text-sm leading-6 text-gray220">
        {t("orders_empty_hint")}
      </p>
    </div>
  );
};

export default EmptyOrders;
