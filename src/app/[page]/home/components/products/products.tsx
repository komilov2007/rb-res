"use client";

import CardProduct from "@/components/card-product";
import { BadgePercent } from "lucide-react";
import { ProductsSkeleton } from "@/components/ui/skleton";
import { useProduct } from "./useProduct";

const Products = () => {
  const {
    products,
    bottomRef,
    isLoading,
    productGroups,
    discountProducts,
    isFetchingNextPage,
  } = useProduct();

  if (isLoading) return <ProductsSkeleton />;
  if (products.length === 0) return null;

  return (
    <section className="mb-5 flex w-full items-center justify-center px-4 py-6 lg:mb-0 lg:py-8">
      <div className="flex w-full max-w-7xl flex-col gap-7 lg:gap-8">
        {discountProducts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow10">
                <BadgePercent size={22} className="text-yellow" />
              </span>
              <h2 className="text-xl font-bold text-black lg:text-2xl">
                Chegirmadagi mahsulotlar
              </h2>
            </div>

            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
              {discountProducts.map((product) => (
                <li key={product.id}>
                  <CardProduct product={product} variant="discount" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {productGroups.map((group) => (
          <div key={group.id}>
            <h2 className="mb-5 text-xl font-bold text-black lg:text-2xl">
              {group.name}
            </h2>

            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
              {group.products.map((product) => (
                <li key={product.id}>
                  <CardProduct product={product} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div ref={bottomRef} className="h-px" />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center gap-2 rounded-full bg-gray10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
