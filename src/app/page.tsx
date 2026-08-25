"use client";

import { memo, Suspense } from "react";
import { Loader } from "@/components/ui/loader";
import Banner from "@/app/[page]/components/banner";
import Categories from "@/app/[page]/components/categories";
import Products from "@/app/[page]/components/products";
import { useGeneral } from "@/hooks/useGeneral";
import PageLayout from "@/app/[page]/components/page-layout";

const Page = () => {
  const { isLoading } = useGeneral();

  return (
    <Suspense>
      <PageLayout showFloatingCart>
        {isLoading ? (
          <div className="flex min-h-screen w-full items-center justify-center bg-white lg:min-h-[calc(100vh-146px)]">
            <Loader />
          </div>
        ) : (
          <>
            <section className="rounded-bl-[30px] rounded-br-[30px] bg-white py-0 lg:py-5">
              <Banner />
              <Categories />
            </section>
            <div className="h-3 bg-gray10" />
            <section className="rounded-[30px] bg-white">
              <Products />
            </section>
          </>
        )}
      </PageLayout>
    </Suspense>
  );
};

export default memo(Page);
