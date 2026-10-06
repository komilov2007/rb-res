"use client";

import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/breadcrumb";
import CardProduct from "@/components/card-product";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";
import type { useCategory } from "@/app/category/[id]/category";
import { EmptyCategoryEmptyCategory as EmptyCategory } from "./desktop-view";
import Link from "next/link";
import { IconLayoutGrid, IconToolsKitchen2Off } from "@tabler/icons-react";
import { useTranslations as useTranslationsEmptyCategory } from "next-intl";
import Button from "@/components/ui/button";
import { ROUTER as ROUTEREmptyCategory } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

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

const EmptyCategoryEmptyCategory = () => {
  const t = useTranslationsEmptyCategory();
  const { shopid } = useShopId();

  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary10">
        <IconToolsKitchen2Off size={36} className="text-primary" />
      </div>

      <p className="mt-4 text-base font-medium text-black">
        {t("catalog_empty_category")}
      </p>
      <p className="mt-1 max-w-xs text-sm font-normal text-gray220">
        {t("catalog_empty_category_hint")}
      </p>

      <Button asChild variant="primary-solid" size="primaryFit" className="mt-5 gap-2">
        <Link
          href={`${ROUTEREmptyCategory.CATEGORIES}${shopid ? `?shop_id=${shopid}` : ""}`}
          className="text-white!"
        >
          <IconLayoutGrid size={18} />
          {t("catalog_all_categories")}
        </Link>
      </Button>
    </div>
  );
};

export { EmptyCategoryEmptyCategory };
