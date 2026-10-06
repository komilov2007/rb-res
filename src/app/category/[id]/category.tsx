"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useBranchSelection } from "@/components/branch-selection";
import { productsQueryOptions } from "@/app/components/products/useProduct";
import { useShopId } from "@/hooks/useShopId";
import type { ProductProps } from "@/types/product";
import { normalizeCategories } from "@/utils/product";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import MobileFooter from "@/components/mobile-footer";
import { BranchSelectionModal } from "@/components/branch-selection/branch-selection-modal";
import FloatingCart from "@/components/floating-cart";
import Footer from "@/components/footer";
import Header from "@/components/header";
import CardProduct from "@/components/card-product";
import ProductBranchPicker from "@/components/modal/product-branch-picker";
import ProductDetailMobile from "@/components/modal/product-detail";
import Button from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";
import DesktopView from "@/app/category/[id]/components/desktop-view/index";
import { EmptyCategoryEmptyCategory as EmptyCategory } from "@/app/category/[id]/components/desktop-view";

export const useCategory = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { shopid } = useShopId();
  const { branchId } = useBranchSelection();

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(productsQueryOptions(shopid));
  const { data: categories } = useShopCategories();

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  const products =
    data?.pages
      .flatMap((page) => page.data.results)
      .filter((product) => product.category?.id === categoryId) ?? [];
  const allCategories = normalizeCategories(categories?.data);
  const category = allCategories.find((item) => item.id === categoryId);
  const isUnavailable = (product: ProductProps) =>
    branchId !== null && !product.branches?.includes(branchId);

  return {
    shopid,
    categoryId,
    categoryName: category?.name ?? products[0]?.category.name ?? "",
    categories: allCategories,
    products,
    isUnavailable,
    isLoading: isLoading || (!isError && Boolean(hasNextPage)),
  };
};

const CategorySkeleton = () => (
  <div className="grid grid-cols-2 gap-1.75">
    {Array.from({ length: 6 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const CategoryContent = () => {
  const t = useTranslations();
  const router = useRouter();
  const category = useCategory();
  const { shopid, categoryName, products, isUnavailable, isLoading } = category;

  const handleBack = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray10 pb-[74px] lg:pb-0">
      <Header pinBottomRow />

      <div className="sticky top-0 z-30 rounded-b-2xl border-b border-gray180 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={handleBack}
            aria-label={t("common_back")}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="min-w-0 truncate text-base font-medium text-black">
            {categoryName}
          </h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-4 pt-4 lg:hidden">
        {isLoading ? (
          <CategorySkeleton />
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white">
            <EmptyCategory />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.75">
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

      <DesktopView {...category} />

      <Footer />
      <FloatingCart />
      <ProductDetailMobile />
      <MobileFooter />
      <BranchSelectionModal />
      <ProductBranchPicker />
    </div>
  );
};

const Category = () => (
  <Suspense>
    <CategoryContent />
  </Suspense>
);

export { Category };

export default Category;
