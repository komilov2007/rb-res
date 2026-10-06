"use client";

import { CARD_HEIGHT_CLASS } from "@/components/card-product/card-product";
import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/utils/cn";

export const CategoriesSkeleton = () => {
  return (
    <section className="mt-3 flex w-full items-center justify-center rounded-b-[20px] bg-white px-4 pb-4 pt-3 lg:mt-0 lg:rounded-b-none lg:pt-3">
      <div className="w-full max-w-7xl">
        <ul className="flex items-center gap-2 overflow-hidden pb-1 lg:items-start lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <li
              key={index}
              className="flex min-w-max items-center lg:min-w-[112px] lg:flex-col lg:gap-2"
            >
              <span className="skeleton hidden h-[100px] w-[112px] rounded-2xl lg:block" />
              <span className="skeleton h-9 w-24 rounded-full lg:h-3 lg:w-20" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const CategoryTileSkeleton = () => {
  return <div className="skeleton aspect-square w-full rounded-xl" />;
};

export const ProductCardSkeleton = () => {
  return (
    <article
      className={`flex ${CARD_HEIGHT_CLASS} w-full flex-col overflow-hidden rounded-[18px] bg-white lg:rounded-[20px]`}
    >
      <div className="skeleton h-[170px] shrink-0 rounded-[18px] lg:h-[240px] lg:rounded-[20px]" />
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton mt-2 h-3 w-full rounded-full" />
        <div className="skeleton mt-1.5 h-3 w-2/3 rounded-full" />
        <div className="skeleton mt-auto h-9 w-full rounded-xl" />
      </div>
    </article>
  );
};

export const ProductsSkeleton = () => {
  return (
    <div className="flex w-full items-center justify-center rounded-[18px] bg-white px-4 py-3">
      <div className="flex w-full max-w-7xl flex-col gap-8">
        <div>
          <div className="skeleton mb-5 h-7 w-56 rounded-full" />
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <li key={index}>
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div>
      <div className="skeleton h-[250px] rounded-[24px]" />
      <div className="px-5 pt-4">
        <div className="skeleton h-6 w-24 rounded-lg" />
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="skeleton h-12 min-w-0 flex-1 rounded-lg" />
          <div className="skeleton h-8 w-16 shrink-0 rounded-full" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="skeleton h-3 w-full rounded-full" />
          <div className="skeleton h-3 w-4/5 rounded-full" />
        </div>
        <div className="skeleton mt-5 h-[72px] rounded-[22px]" />
      </div>
    </div>
  );
};

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-colors",
        "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray180",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
