"use client";

import { useLayoutEffect, useMemo, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import type { ProductProps } from "@/types/product";

import { STICKY_GAP, type CategorySortOption } from "./constants";

type UseDesktopViewParams = {
  categoryId: number;
  products: ProductProps[];
};

export const useDesktopView = ({ categoryId, products }: UseDesktopViewParams) => {
  const [sort, setSort] = useState<CategorySortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  // Measures the real, rendered <header> instead of hardcoding its height
  // (93px) — a hand-picked number kept drifting from whatever the sticky
  // header actually renders at, leaving the sidebar's stuck position either
  // overlapping it or sitting too far below it. Re-measures on resize.
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

  // The product-list endpoint has no price-range/sort params (see apis/products.ts),
  // so bounds come from whatever's already loaded for this category.
  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 0];

    const prices = products.map((product) => product.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const [minBound, maxBound] = priceBounds;

  // Switching categories (or the loaded products' price bounds changing)
  // shouldn't carry over the previous filter. Reset during render when the
  // inputs change (React's "storing information from previous renders"
  // pattern) instead of in an effect, which cost an extra render. Not a
  // `key` on DesktopView: the bounds are only known here, and remounting
  // the whole view on every product-set change would recreate its DOM.
  const resetKey = `${categoryId}:${minBound}:${maxBound}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPriceRange([minBound, maxBound]);
    setSort("default");
  }

  // Dragging the slider fires setPriceRange on every step — debounced so the
  // grid isn't re-filtered on each intermediate value, only once dragging
  // settles. The slider itself still reads the live (non-debounced)
  // priceRange below, so the thumb/labels stay responsive while dragging.
  const filterInput = useMemo(
    () => ({ categoryId, priceRange }),
    [categoryId, priceRange],
  );
  const debouncedFilter = useDebounce(filterInput, 300);
  const isCurrentCategoryFilter = debouncedFilter.categoryId === categoryId;
  const debouncedPriceRange = isCurrentCategoryFilter
    ? debouncedFilter.priceRange
    : null;
  const [minPrice, maxPrice] = debouncedPriceRange ?? priceBounds;
  const isFiltering =
    priceRange !== null &&
    debouncedPriceRange !== null &&
    (priceRange[0] !== debouncedPriceRange[0] ||
      priceRange[1] !== debouncedPriceRange[1]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice,
    );

    if (sort === "price_asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return [...filtered].sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, minPrice, maxPrice, sort]);

  return {
    sort,
    setSort,
    priceBounds,
    hasPriceSpread: maxBound > minBound,
    priceRange: priceRange ?? priceBounds,
    setPriceRange,
    visibleProducts,
    isFiltering,
    stickyTop: headerHeight + STICKY_GAP,
  };
};
