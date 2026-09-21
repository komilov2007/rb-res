"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import type { CategoriesProps } from "@/types/categories";

import PriceRange from "../price-range";

// Half of max-w-7xl (1280px), the page's own content container. On screens
// narrower than that the container has no centering margin at all (its left
// edge already sits at the true viewport edge), so this is clamped at 0.
const HALF_CONTAINER = 640;
// px-5 (20px, the container's own side padding) + w-65 (260px, the sidebar's
// width) — the distance from the container's left edge to where the sidebar
// used to end, before this became a full-bleed layout.
const SIDEBAR_INSET = 280;

type CategorySidebarProps = {
  shopQuery: string;
  stickyTop: number;
  categories: CategoriesProps[];
  categoryId: number;
  hasPriceSpread: boolean;
  priceBounds: [number, number];
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
};

// Desktop category page's sticky left panel: category links + price filter.
const CategorySidebar = ({
  shopQuery,
  stickyTop,
  categories,
  categoryId,
  hasPriceSpread,
  priceBounds,
  priceRange,
  setPriceRange,
}: CategorySidebarProps) => {
  const t = useTranslations();

  // This element's width places the sidebar exactly where it used to
  // sit (container's left inset + its own width) while everything to
  // the left of that, out to the true viewport edge, is now also
  // white — the same math Header/Footer's own centering already
  // relies on, just solved for "one edge" instead of both. `50%` here
  // (of this row, which is already the real available width) — not
  // `50vw`, which historically includes the scrollbar's own width in
  // most browsers and was making this a few px too wide, pushing the
  // grid past the right edge.
  //
  // This element is BOTH the sticky element AND the full-height
  // background (it used to be a plain stretched wrapper around a
  // separate `self-start` sticky <aside> — that nested combination
  // was landing "Kategoriyalar" well below the section's title in
  // some browsers). Being sticky itself and spanning the row's full
  // height is fine: the sticky "stuck" point only depends on this
  // box's own top edge, not its height, so it still pins correctly;
  // its content just needs to sit at ITS top, which a plain block
  // child does by default with no self-start/stretch fight involved.
  return (
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
  );
};

export default CategorySidebar;
