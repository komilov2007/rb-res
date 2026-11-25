"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { categoriesProductsQueryOptions } from "@/app/components/products/products";
import ProductGrid from "@/app/components/products/components/product-grid";
import { useBranchSelection } from "@/components/branch-selection";
import { ProductsSkeleton } from "@/components/ui/skeleton";
import { useShopId } from "@/hooks/useShopId";

type AllProductsProps = {
  categoryIds: number[];
};

// Kategoriyalar sahifasi uchun: barcha mahsulotlar bitta uzluksiz grid'da —
// kategoriya sarlavhasi/banneri yo'q, qatorlar kategoriya chegarasida uzilmaydi.
// So'rov home bilan bir xil (kesh umumiy).
const AllProducts = ({ categoryIds }: AllProductsProps) => {
  const { shopid } = useShopId();
  const { branchId } = useBranchSelection();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(categoriesProductsQueryOptions(shopid, categoryIds));

  useEffect(() => {
    const target = bottomRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "1500px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  if (isLoading) return <ProductsSkeleton />;

  // Bir mahsulot bir nechta kategoriyada bo'lsa, faqat bir marta ko'rinsin
  const products = [
    ...new Map(
      (data?.pages.flatMap((page) => page.data.results) ?? []).map(
        (product) => [product.id, product],
      ),
    ).values(),
  ];

  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-xl px-4 lg:max-w-7xl lg:px-5">
      <ProductGrid products={products} branchId={branchId} />
      <div ref={bottomRef} className="h-px" />
      {isFetchingNextPage && (
        <div className="opacity-80">
          <ProductsSkeleton />
        </div>
      )}
    </section>
  );
};

export default AllProducts;
