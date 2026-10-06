"use client";

import type { ProductProps } from "@/types/product";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import ProductGrid from "../product-grid";
import CategoryBanner from "../category-banner";
import { CategoryBanner2 } from "../category-banner";
import Link from "next/link";
import { IconArrowRight, IconLayoutGrid } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

type CategoryProductsProps = {
  group: {
    id: string;
    name: string;
    products: ProductProps[];
  };
  videoSrc?: string;
  mobileBannerSizeVariant?: "mini" | "sm" | "md" | "lg" | "xl" | "big";
  branchId?: number | null;
};

const CategoryProducts = ({
  group,
  videoSrc,
  mobileBannerSizeVariant = "sm",
  branchId = null,
}: CategoryProductsProps) => {
  const { shopid } = useShopId();
  const categoryHref = `${ROUTER.CATEGORY}/${group.id}${shopid ? `?shop_id=${shopid}` : ""}`;

  return (
    <div
      id={`category-${group.id}`}
      data-category-section={group.id}
      className="flex scroll-mt-32 flex-col"
    >
      <div className="hidden lg:block">
        <CategoryBanner2
          title={group.name}
          videoSrc={videoSrc}
          href={categoryHref}
        />
      </div>
      <div className="relative z-10 hidden lg:block">
        <ProductGrid
          products={group.products}
          branchId={branchId}
          moreHref={categoryHref}
        />
      </div>
      <div className="lg:hidden">
        <CategoryBanner
          title={group.name}
          videoSrc={videoSrc}
          sizeVariant={mobileBannerSizeVariant}
        />
      </div>
      <div className="relative z-10 -mt-[62px] lg:hidden">
        <ProductGrid products={group.products} branchId={branchId} />
      </div>
    </div>
  );
};
export default CategoryProducts;

type CategoryMoreCardProps = {
  href: string;
  count: number;
};

const CategoryMoreCard = ({ href, count }: CategoryMoreCardProps) => {
  const t = useTranslations();

  return (
    <Link
      href={href}
      className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-gray180 bg-white px-4 text-center transition-transform duration-300 ease-out hover:-translate-y-0.5"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary10 text-primary">
        <IconLayoutGrid size={28} />
      </span>
      <span className="text-sm font-normal text-gray220">
        {t("home_more_products", { count })}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
        {t("home_see_all")}
        <IconArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
};

export { CategoryMoreCard };
