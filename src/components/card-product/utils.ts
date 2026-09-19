import type { CardProductProps } from "@/types/product";

export type ProductVariant = NonNullable<CardProductProps["variant"]>;
export type SaleBadgeVariant = NonNullable<CardProductProps["saleBadgeVariant"]>;

export const CARD_HEIGHT_CLASS = "h-[306px] lg:h-[392px]";

export const SALE_VARIANT_CLASS_NAMES: Record<
  SaleBadgeVariant,
  { badge: string }
> = {
  primary: {
    badge: "bg-primary",
  },
  green: {
    badge: "bg-green-500",
  },
  red: {
    badge: "bg-red-500",
  },
  orange: {
    badge: "bg-orange-500",
  },
};

export const shouldUseDiscountCard = (
  variant: ProductVariant,
  isDiscount: boolean,
) => {
  return isDiscount && variant !== "default" ? true : isDiscount;
};
