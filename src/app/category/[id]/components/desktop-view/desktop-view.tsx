"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
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
import { ProductCardSkeleton } from "@/components/ui/skleton";
import { ROUTER } from "@/constants/router";
import type { CategoriesProps } from "@/types/categories";
import type { ProductProps } from "@/types/product";

import PriceRange from "../price-range";
import { useDesktopView, type CategorySortOption } from "./useDesktopView";

// `label` holds a translation key, resolved with t() at render.
const SORT_OPTIONS: { value: CategorySortOption; label: string }[] = [
  { value: "default", label: "catalog_sort_newest" },
  { value: "price_asc", label: "catalog_sort_price_asc" },
  { value: "price_desc", label: "catalog_sort_price_desc" },
];

// Half of max-w-7xl (1280px), the page's own content container. On screens
// narrower than that the container has no centering margin at all (its left
// edge already sits at the true viewport edge), so this is clamped at 0.
const HALF_CONTAINER = 640;
// px-5 (20px, the container's own side padding) + w-65 (260px, the sidebar's
// width) — the distance from the container's left edge to where the sidebar
// used to end, before this became a full-bleed layout.
const SIDEBAR_INSET = 280;

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
        {/* This element's width places the sidebar exactly where it used to
            sit (container's left inset + its own width) while everything to
            the left of that, out to the true viewport edge, is now also
            white — the same math Header/Footer's own centering already
            relies on, just solved for "one edge" instead of both. `50%` here
            (of this row, which is already the real available width) — not
            `50vw`, which historically includes the scrollbar's own width in
            most browsers and was making this a few px too wide, pushing the
            grid past the right edge.

            This element is BOTH the sticky element AND the full-height
            background (it used to be a plain stretched wrapper around a
            separate `self-start` sticky <aside> — that nested combination
            was landing "Kategoriyalar" well below the section's title in
            some browsers). Being sticky itself and spanning the row's full
            height is fine: the sticky "stuck" point only depends on this
            box's own top edge, not its height, so it still pins correctly;
            its content just needs to sit at ITS top, which a plain block
            child does by default with no self-start/stretch fight involved. */}
        <aside
          className="sticky shrink-0 rounded-r-2xl bg-white"
          style={{
            top: stickyTop,
            width: `calc(max(0px, 50% - ${HALF_CONTAINER}px) + ${SIDEBAR_INSET}px)`,
          }}
        >
          <div
            className="ml-auto flex w-65 shrink-0 flex-col gap-6 overflow-y-auto p-5"
            style={{ maxHeight: `calc(100vh - ${stickyTop + 16}px)` }}
          >
            <h3 className="text-lg font-bold text-black">
              {t("search_categories")}
            </h3>

            {/* Every row shares the same px-3/gap-2 rhythm and a same-size
                leading icon slot (invisible on plain rows) so the text always
                starts at the same x — otherwise the icon-less category rows
                sit ~24px left of the "Barcha kategoriyalar" row's text. */}
            <div className="flex flex-col gap-1">
              <Link
                href={`${ROUTER.CATEGORIES}${shopQuery}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray220 hover:bg-gray10"
              >
                <ChevronLeft size={16} className="shrink-0" />
                {t("catalog_all_categories")}
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`${ROUTER.CATEGORY}/${category.id}${shopQuery}`}
                  scroll={false}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    category.id === categoryId
                      ? "bg-gray180 font-bold text-black"
                      : "text-black hover:bg-gray10"
                  }`}
                >
                  <ChevronLeft size={16} className="shrink-0 opacity-0" />
                  <span className="truncate">{category.name}</span>
                </Link>
              ))}
            </div>

            {hasPriceSpread && (
              <>
                <hr className="border-gray180" />
                <PriceRange
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  value={priceRange}
                  onChange={setPriceRange}
                />
              </>
            )}
          </div>
        </aside>

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
