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
    <section className="hidden w-full items-center justify-center px-4 py-8 lg:flex">
      <div className="flex w-full max-w-7xl flex-col gap-8">
        {discountProducts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow10">
                <BadgePercent size={22} className="text-yellow" />
              </span>
              <h2 className="text-2xl font-bold text-black">
                Chegirmadagi mahsulotlar
              </h2>
            </div>

            <ul className="grid grid-cols-5 gap-4">
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
            <h2 className="mb-5 text-2xl font-bold text-black">{group.name}</h2>

            <ul className="grid grid-cols-5 gap-4">
              {group.products.map((product) => (
                <li key={product.id}>
                  <CardProduct product={product} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div ref={bottomRef} />
        {isFetchingNextPage && <ProductsSkeleton />}
      </div>
    </section>
  );
};

export default Products;
