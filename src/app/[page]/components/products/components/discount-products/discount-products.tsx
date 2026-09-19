import { useTranslations } from "next-intl";
import { BadgePercent } from "lucide-react";

import type { ProductProps } from "@/types/product";
import type { DiscountProductVariant, SaleBadgeVariant } from "../../types";

import ProductSwiper from "../product-swiper";

type DiscountProductsProps = {
  products: ProductProps[];
  variant?: DiscountProductVariant;
  saleBadgeVariant?: SaleBadgeVariant;
  branchId?: number | null;
};

const DiscountProducts = ({
  products,
  variant = "discountRight2",
  saleBadgeVariant = "red",
  branchId = null,
}: DiscountProductsProps) => {
  const t = useTranslations();

  if (products.length === 0) return null;

  return (
    <div className="flex flex-col pt-4 lg:pt-0">
      <h2 className="title50 mb-4 flex items-center gap-2 text-black lg:text-2xl">
        <BadgePercent
          size={22}
          strokeWidth={2.2}
          className="shrink-0 text-red-500"
          aria-hidden="true"
        />
        {t("discount_products")}
      </h2>
      <div className="relative z-10">
        <ProductSwiper
          products={products}
          variant={variant}
          saleBadgeVariant={saleBadgeVariant}
          branchId={branchId}
        />
      </div>
    </div>
  );
};

export default DiscountProducts;
