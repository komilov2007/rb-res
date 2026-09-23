import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

// Same structural pattern as cart's EmptyCart (icon-in-circle + heading +
// hint). col-span-full: spans the whole row of the desktop card grid.
const EmptyOrders = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center lg:col-span-full">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <PackageSearch size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-medium text-black">
        {t("orders_empty_title")}
      </h3>
      <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray220">
        {t("orders_empty_hint")}
      </p>
    </div>
  );
};

export default EmptyOrders;
