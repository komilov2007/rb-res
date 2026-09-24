import type { CardProductProps } from "@/types/product";

export type ProductsVariant = NonNullable<CardProductProps["variant"]>;
export type DiscountProductVariant = Exclude<ProductsVariant, "default">;
export type SaleBadgeVariant = NonNullable<CardProductProps["saleBadgeVariant"]>;
