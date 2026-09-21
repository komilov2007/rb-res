"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useState } from "react";

import CardProduct from "@/components/card-product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";
import type { CategoriesProps } from "@/types/categories";
import type { ProductProps } from "@/types/product";

import CategorySidebar from "../category-sidebar";
import { useDesktopView, type CategorySortOption } from "./useDesktopView";

// `label` holds a translation key, resolved with t() at render.
const SORT_OPTIONS: { value: CategorySortOption; label: string }[] = [
  { value: "default", label: "catalog_sort_newest" },
  { value: "price_asc", label: "catalog_sort_price_asc" },
  { value: "price_desc", label: "catalog_sort_price_desc" },
];

type DesktopViewProps = {
  shopid?: string;
  categoryId: number;
  categoryName: string;
  categories: CategoriesProps[];
  products: ProductProps[];
  isUnavailable: (product: ProductProps) => boolean;
  hasBranch: boolean;
  availableCount: number;
  isLoading: boolean;
};

// Desktop-only layout for this route: breadcrumb + category/price sidebar +
// sorted grid. The mobile back-button shell in category.tsx stays untouched.
// Rendered unconstrained (category.tsx does NOT wrap this in a max-w-7xl/px-5
// container) so the sidebar and grid panels below can bleed their own white
// background all the way to the viewport edges, with only a deliberate gray
// gap showing between them — matching how Header/Footer already bleed their
// white bars edge to edge while centering their own inner content.
const DesktopView = ({
  shopid,
  categoryId,
  categoryName,
  categories,
  products,
  isUnavailable,
  hasBranch,
  availableCount,
  isLoading,
}: DesktopViewProps) => {
  const t = useTranslations();
  const {
    sort,
    setSort,
    priceBounds,
    priceRange,
    setPriceRange,
    visibleProducts,
    isFiltering,
  } = useDesktopView({ categoryId, products });
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";
  const hasPriceSpread = priceBounds[1] > priceBounds[0];
  const isCategoryEmpty = !isLoading && products.length === 0;
  const isFilteredEmpty =
    !isLoading && products.length > 0 && visibleProducts.length === 0;

  // Measures the real, rendered <header> instead of hardcoding its height
  // (93px) — a hand-picked number here kept drifting from whatever the
  // sticky header actually renders at, leaving the sidebar's stuck position
  // either overlapping it or sitting too far below it. This is exact
  // regardless of font/zoom/content changes, and re-measures on resize.
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const headerEl = document.querySelector<HTMLElement>("header");
    if (!headerEl) return;

    const updateHeight = () => setHeaderHeight(headerEl.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerEl);

    return () => observer.disconnect();
  }, []);

  const stickyTop = headerHeight + 16;

  return (
    <div className="hidden w-full flex-1 flex-col lg:flex">
      {/* Full-bleed white bar, same pattern as Header/Footer: the bar itself
          spans edge to edge, an inner max-w-7xl wrapper centers the links. */}
      <div className="w-full border-b border-gray180 bg-white">
        <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 px-5 py-4 text-xs text-gray220">
          <Link
            href={`${ROUTER.HOME}${shopQuery}`}
            className="flex items-center gap-1.5 font-medium hover:text-black"
          >
            <Home size={14} />
            {t("catalog_home")}
          </Link>
          <ChevronRight size={14} />
          <Link
            href={`${ROUTER.CATEGORIES}${shopQuery}`}
            className="font-medium hover:text-black"
          >
            {t("catalog_all_categories")}
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-black">{categoryName}</span>
        </nav>
      </div>

      {/* No items-start here (default is stretch): both panels below need to
          match the row's full height so their white backgrounds line up,
          even though the sidebar's own content is much shorter than the
          grid's. gap-1.25/pt-1.25: the same small (5px) gap both between the
          two panels and below the breadcrumb, as requested. overflow-x-hidden
          is a safety net: the sidebar's width below is computed, and this
          guarantees the grid can never visibly spill past this row even if
          that computed value is ever a hair too wide in some browser/zoom
          combination. */}
      <div className="flex w-full gap-1.25 overflow-x-hidden pb-1.25 pt-1.25">
        <CategorySidebar
          shopQuery={shopQuery}
          stickyTop={stickyTop}
          categories={categories}
          categoryId={categoryId}
          hasPriceSpread={hasPriceSpread}
          priceBounds={priceBounds}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        {/* flex-1 with no right constraint on this row means this panel's
            own white background already reaches the true viewport edge — no
            calc needed on this side, unlike the sidebar wrapper above. The
            extra right padding (growing at wider breakpoints) is deliberate
            breathing room, not a layout bug: the background still bleeds to
            the edge, only the 4-card grid's content is inset further from
            it, so the 4 cards sit slightly more compact than edge-to-edge.
            min-w-0 on this section keeps it shrinkable so this padding can
            never force an overflow at the narrow end of lg. */}
        <section className="relative flex min-w-0 flex-1 flex-col gap-6 rounded-l-2xl bg-white py-5 pl-5 pr-24 xl:pr-56 2xl:pr-80">
          {/* items-start (not items-center): centering against the taller
              Select dropdown was pushing "Ichimliklar" a few px below where
              "Kategoriyalar" sits in the sidebar, despite both panels having
              the same p-5. Top-aligning both makes the two headings land on
              the same line. */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-black">{categoryName}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray220">
                {t("catalog_sort_label")}
              </span>
              <Select
                value={sort}
                onValueChange={(value) => setSort(value as CategorySortOption)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasBranch && availableCount === 0 && (
            <p className="rounded-2xl bg-gray10 px-4 py-3 text-center text-sm font-medium text-gray220">
              {t("catalog_empty_at_branch")}
            </p>
          )}

          {isLoading || isFiltering ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : isCategoryEmpty ? (
            <p className="py-10 text-center text-sm font-medium text-gray220">
              {t("catalog_empty_category")}
            </p>
          ) : isFilteredEmpty ? (
            <p className="py-10 text-center text-sm font-medium text-gray220">
              {t("catalog_no_filter_match")}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <CardProduct
                  key={product.id}
                  product={product}
                  isUnavailable={isUnavailable(product)}
                  whiteSurface
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DesktopView;
