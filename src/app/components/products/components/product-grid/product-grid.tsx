"use client";

import CardProduct from "@/components/card-product";
import type { ProductProps } from "@/types/product";
import type { DiscountProductVariant, SaleBadgeVariant } from "../../types";

import CategoryMoreCard from "../category-more-card";

// Desktop: 2 rows of 5. Past this, the last cell becomes a "see all" card.
const DESKTOP_MAX_CARDS = 10;

type ProductGridProps = {
  products: ProductProps[];
  variant?: DiscountProductVariant;
  saleBadgeVariant?: SaleBadgeVariant;
  // Selected home branch — products not sold there are shown muted.
  branchId?: number | null;
  // Category page link. When set, desktop shows at most DESKTOP_MAX_CARDS
  // cells, the last one linking here.
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
