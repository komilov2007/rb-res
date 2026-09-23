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
// width) — the distance from the container's left edge to the sidebar's end.
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

// Desktop category page's left panel: category links + price filter.
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

  // The <aside> is the full-height white background: its width puts the
  // sidebar's content exactly at the centered container's left inset while
  // everything to the left of it, out to the true viewport edge, is also
  // white. `50%` is of this row (the real available width) — not `50vw`,
  // which includes the scrollbar in most browsers.
  //
  // The inner block is the sticky one: a sticky element that fills its
  // containing block (as the stretched <aside> does) has no room to move,
  // so it only pins when it's a shorter child of that tall <aside>.
  return (
    <aside
      className="shrink-0 rounded-r-2xl bg-white"
      style={{
        width: `calc(max(0px, 50% - ${HALF_CONTAINER}px) + ${SIDEBAR_INSET}px)`,
      }}
    >
      <div
        className="sticky ml-auto flex w-65 flex-col gap-6 overflow-y-auto p-5"
        style={{
          top: stickyTop,
          maxHeight: `calc(100vh - ${stickyTop + 16}px)`,
        }}
      >
        <h3 className="text-lg font-medium text-black">
          {t("search_categories")}
        </h3>

        {/* Every row shares the same px-3/gap-2 rhythm and a same-size
            leading icon slot (invisible on plain rows) so the text always
            starts at the same x. */}
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
              aria-current={category.id === categoryId ? "page" : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-black ${
                category.id === categoryId ? "bg-gray180" : "hover:bg-gray10"
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
