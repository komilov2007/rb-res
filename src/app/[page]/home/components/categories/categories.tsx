"use client";

import { getCategories } from "@/apis/categories";
import { CategoriesSkeleton } from "@/components/ui/skleton";
import { useShopid } from "@/hooks/useShopId";
import type { CategoriesProps } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";

const Categories = () => {
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const categories = data?.data.slice(0, 8) ?? [];

  if (isLoading) return <CategoriesSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section
      data-categories
      className="mt-3 flex w-full items-center justify-center rounded-b-[20px] bg-white px-4 pb-4 pt-3 lg:mt-0 lg:rounded-b-none lg:pt-3"
    >
      <div className="w-full max-w-7xl">
        <ul
          role="list"
          className="scroll-hidden flex items-start gap-4 overflow-x-auto pb-1 lg:gap-6"
        >
          {categories.map((item: CategoriesProps) => (
            <li key={item.id} className="flex-none">
              <div className="flex min-w-max flex-col items-center gap-2 lg:min-w-[112px]">
                <span className="flex h-[78px] w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray10 lg:h-[100px] lg:w-[112px]">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="max-w-[86px] truncate text-center text-sm font-semibold text-black lg:max-w-[112px]">
                  {item.name}
                </span>
              </div>
            </li>
          ))}
          <li className="flex-none">
            <div className="flex min-w-max flex-col items-center gap-2 lg:min-w-[112px]">
              <span className="group flex h-[78px] w-[86px] shrink-0 items-center justify-center rounded-2xl border border-gray180 bg-[#F6F7F9] transition-colors duration-200 hover:border-primary/30 hover:bg-primary10 lg:h-[100px] lg:w-[112px]">
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-white text-gray220 transition-colors duration-200 group-hover:text-primary lg:h-13 lg:w-13">
                  <span className="absolute -right-1 -top-1 h-5 w-5 rounded-md bg-yellow10" />
                  <ImagePlus
                    size={27}
                    strokeWidth={1.8}
                    className="relative"
                  />
                </span>
              </span>
              <span className="max-w-[86px] truncate text-center text-sm font-bold text-black lg:max-w-[112px]">
                Boshqa
              </span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Categories;
