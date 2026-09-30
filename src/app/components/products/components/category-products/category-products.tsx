"use client";

import type { ProductProps } from "@/types/product";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

import ProductGrid from "../product-grid";
import CategoryBanner from "../category-banner";
import CategoryBanner2 from "../category-banner-2";

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
