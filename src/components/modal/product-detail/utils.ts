import type { ProductSkuProps } from "@/types/product";
import { translate } from "@/utils/translate";

export const stripHtml = (value?: string | null) => {
  return value?.replace(/<[^>]*>/g, "").trim() ?? "";
};

export const getOldPrice = ({
  price,
  discountPrice,
  saleAmount,
  saleType,
}: {
  price: number;
  discountPrice?: number | null;
  saleAmount?: number | null;
  saleType?: string | null;
}) => {
  if (discountPrice && price > discountPrice) return price;

  if (saleType === "PERCENT" && saleAmount && saleAmount < 100) {
    return Math.round(price / (1 - saleAmount / 100));
  }

  return null;
};

export const getSkuMeta = (sku: ProductSkuProps) => {
  const unit = sku.unit?.unit || sku.unit?.name;

  if (sku.amount > 0 && unit) return `${sku.amount} ${unit}`;
  if (sku.status === "UNLIMITED") return translate("product_in_stock");
  return null;
};
