"use client";

import { useTranslations } from "next-intl";

import Breadcrumb from "@/components/breadcrumb";
import CardProduct from "@/components/card-product";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";

import type { useCategory } from "../../useCategory";
import EmptyCategory from "../empty-category";

const GRID_CLASS_NAME = "grid grid-cols-4 gap-5 xl:grid-cols-5";

type DesktopViewProps = ReturnType<typeof useCategory>;

const DesktopView = ({
  categoryName,
  products,
  isUnavailable,
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

          {isLoading ? (
            <div className={GRID_CLASS_NAME}>
              {Array.from({ length: 10 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyCategory />
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
