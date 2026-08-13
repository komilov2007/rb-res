"use client";
import { getCategories } from "@/apis/categories";
import { CategoriesSkeleton } from "@/components/ui/skleton";
import { useShopid } from "@/hooks/useShopId";
import type { CategoriesProps } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";

const Categories = () => {
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const categories = data?.data ?? [];

  if (isLoading) return <CategoriesSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section className="hidden w-full items-center justify-center px-4 pt-3 lg:flex">
      <div className="w-full max-w-7xl">
        <ul
          role="list"
          className="scroll-hidden flex items-start gap-6 overflow-x-auto pb-1"
        >
          {categories.map((item: CategoriesProps) => (
            <li key={item.id} className="flex-none">
              <button className="flex min-w-[112px] flex-col items-center gap-2">
                <span className="flex h-[100px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray10">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="max-w-[112px] truncate text-center text-sm font-semibold text-black">
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Categories;
