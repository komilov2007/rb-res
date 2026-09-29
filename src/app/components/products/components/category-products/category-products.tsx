import type { ProductProps } from "@/types/product";

import ProductSwiper from "../product-swiper";
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
  return (
    <div
      id={`category-${group.id}`}
      data-category-section={group.id}
      className="flex scroll-mt-32 flex-col"
    >
      <div className="hidden lg:block">
        <CategoryBanner2 title={group.name} videoSrc={videoSrc} />
      </div>
      <div className="relative z-10 hidden lg:block">
        <ProductSwiper products={group.products} branchId={branchId} />
      </div>
      <div className="lg:hidden">
        <CategoryBanner
          title={group.name}
          videoSrc={videoSrc}
          sizeVariant={mobileBannerSizeVariant}
        />
      </div>
      <div className="relative z-10 -mt-[62px] lg:hidden">
        <ProductSwiper products={group.products} branchId={branchId} />
      </div>
    </div>
  );
};
export default CategoryProducts;

