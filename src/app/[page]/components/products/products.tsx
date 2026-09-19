"use client";
import "swiper/css";

import { ProductsSkeleton } from "@/components/ui/skleton";
import { hasDiscount } from "@/utils/product";
import { useBranchSelection } from "@/app/[page]/components/branch-selection";

import { CategoryProducts, DiscountProducts } from "./components";
import { useProduct } from "./useProduct";

const Products = () => {
  const { products, bottomRef, isLoading, productGroups, isFetchingNextPage } =
    useProduct();
  // Selected branch drives the live "Bu filialda yo'q" muting below.
  const { branchId } = useBranchSelection();

  if (isLoading) return <ProductsSkeleton />;
  if (products.length === 0) return null;

  const discountProducts = products.filter(hasDiscount);

  return (
    <>
      <section className="mb-5 flex w-full items-center justify-center overflow-x-hidden px-4 pb-6 pt-0 lg:mb-0 lg:py-8">
        <div className="flex w-full max-w-7xl flex-col gap-7 lg:gap-8">
          <DiscountProducts
            products={discountProducts}
            variant="discountRight2"
            saleBadgeVariant="red"
            branchId={branchId}
          />

          {productGroups.map((group, index) => (
            <CategoryProducts
              key={group.id}
              group={group}
              branchId={branchId}
              videoSrc={
                index === 0
                  ? "/banner.mp4"
                  : index === 1
                    ? "/banner2.mp4"
                    : undefined
              }
            />
          ))}

          <div ref={bottomRef} className="h-px" />
          {isFetchingNextPage && (
            <div className="opacity-80">
              <ProductsSkeleton />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
