// Only sort orders backed by real product fields — no popularity/rating
// field exists on ProductProps, so no such option is offered here.
export const CATEGORY_SORT_OPTIONS = [
  // `label` holds a translation key, resolved with t() at render.
  { value: "default", label: "catalog_sort_newest" },
  { value: "price_asc", label: "catalog_sort_price_asc" },
  { value: "price_desc", label: "catalog_sort_price_desc" },
] as const;

export type CategorySortOption = (typeof CATEGORY_SORT_OPTIONS)[number]["value"];

export const isCategorySortOption = (
  value: string,
): value is CategorySortOption =>
  CATEGORY_SORT_OPTIONS.some((option) => option.value === value);

// Half of max-w-7xl (1280px) minus its px-5 side padding (20px): how far the
// centered container's content edge sits from the row's middle. Used to line
// the full-bleed panels' content up with Header/Footer's centered content.
export const HALF_CONTAINER_CONTENT = 620;

// Gap between the sticky sidebar and the header above it.
export const STICKY_GAP = 16;
