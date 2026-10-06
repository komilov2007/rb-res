"use client";

import CardProduct from "@/components/card-product";
import type { ProductProps } from "@/types/product";
import type { DiscountProductVariant, SaleBadgeVariant } from "@/app/components/products/useProduct";
import { CategoryMoreCard } from "../category-products";
import { useTranslations } from "next-intl";
import { BadgePercent } from "lucide-react";
import type { ProductProps as ProductPropsDiscountProducts } from "@/types/product";
import type { DiscountProductVariant as DiscountProductVariantDiscountProducts, SaleBadgeVariant as SaleBadgeVariantDiscountProducts } from "@/app/components/products/useProduct";
import ProductGridDiscountProducts from "@/app/components/products/components/product-grid";

const DESKTOP_MAX_CARDS = 10;

type ProductGridProps = {
  products: ProductProps[];
  variant?: DiscountProductVariant;
  saleBadgeVariant?: SaleBadgeVariant;
  branchId?: number | null;
  moreHref?: string;
};

const ProductGrid = ({
  products,
  variant,
  saleBadgeVariant = "red",
  branchId = null,
  moreHref,
}: ProductGridProps) => {
  const isUnavailable = (product: ProductProps) =>
    branchId !== null && !product.branches?.includes(branchId);
  const bottomPaddingClassName = variant ? "pb-0" : "pb-8";
  const hasMore = Boolean(moreHref) && products.length > DESKTOP_MAX_CARDS;
  const desktopProducts = hasMore
    ? products.slice(0, DESKTOP_MAX_CARDS - 1)
    : products;

  const renderCard = (product: ProductProps) => (
    <CardProduct
      key={product.id}
      product={product}
      variant={variant}
      saleBadgeVariant={saleBadgeVariant}
      isUnavailable={isUnavailable(product)}
    />
  );

  return (
    <>
      <div
        className={`grid grid-cols-2 gap-1.75 lg:hidden ${bottomPaddingClassName}`}
      >
        {products.map(renderCard)}
      </div>

      <div
        className={`hidden grid-cols-5 gap-5 pt-1 lg:grid ${bottomPaddingClassName}`}
      >
        {desktopProducts.map(renderCard)}
        {hasMore && moreHref && (
          <CategoryMoreCard
            href={moreHref}
            count={products.length - desktopProducts.length}
          />
        )}
      </div>
    </>
  );
};

export default ProductGrid;

type DiscountProductsProps = {
  products: ProductPropsDiscountProducts[];
  variant?: DiscountProductVariantDiscountProducts;
  saleBadgeVariant?: SaleBadgeVariantDiscountProducts;
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
        <ProductGridDiscountProducts
          products={products}
          variant={variant}
          saleBadgeVariant={saleBadgeVariant}
          branchId={branchId}
        />
      </div>
    </div>
  );
};

export { DiscountProducts };
