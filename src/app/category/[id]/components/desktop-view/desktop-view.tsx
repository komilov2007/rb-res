"use client";

import { useTranslations } from "next-intl";

import Breadcrumb from "@/components/breadcrumb";
import CardProduct from "@/components/card-product";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";

import type { useCategory } from "../../useCategory";

// 5 per row with a 20px gap — the same density as the home product rows.
const GRID_CLASS_NAME = "grid grid-cols-4 gap-5 xl:grid-cols-5";

type DesktopViewProps = ReturnType<typeof useCategory>;

// Desktop-only: breadcrumb under the header, then the product list as its own
// white section (like home's) with a gray gap above and below it. The mobile
// shell in category.tsx stays untouched.
const DesktopView = ({
  categoryName,
  products,
  isUnavailable,
  hasBranch,
  availableCount,
  isLoading,
}: DesktopViewProps) => {
  const t = useTranslations();

  return (
    <div className="hidden w-full flex-1 flex-col lg:flex">
      <Breadcrumb
        items={[
          { label: t("catalog_all_categories"), href: ROUTER.CATEGORIES },
          { label: categoryName },
        ]}
      />

      <section className="my-2 flex flex-1 flex-col rounded-[30px] bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6">
          <h1 className="truncate text-xl font-medium text-black">
            {categoryName}
          </h1>

          {!isLoading && hasBranch && availableCount === 0 && (
            <p className="rounded-2xl bg-gray10 px-4 py-3 text-center text-sm font-normal text-gray220">
              {t("catalog_empty_at_branch")}
            </p>
          )}

          {isLoading ? (
            <div className={GRID_CLASS_NAME}>
              {Array.from({ length: 10 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-sm font-normal text-gray220">
              {t("catalog_empty_category")}
            </p>
          ) : (
            <div className={GRID_CLASS_NAME}>
              {products.map((product) => (
                <CardProduct
                  key={product.id}
                  product={product}
                  isUnavailable={isUnavailable(product)}
                  whiteSurface
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DesktopView;
