"use client";
import { Suspense, useEffect } from "react";
import NotFound from "@/components/404";
import { Loader } from "@/components/ui/loader";
import { useGeneral } from "@/hooks/useGeneral";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import Banner from "@/app/[page]/components/banner";
import Products from "@/app/[page]/components/products";
import Categories from "@/app/[page]/components/categories";
import PageLayout from "@/app/[page]/components/page-layout";
import { useBranchSelection } from "@/app/[page]/components/branch-selection";

const Page = () => {
  const { isLoading, isError } = useGeneral();
  const { isReady, serviceType } = useBranchSelection();
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const hasAccess = useAuthStore((state) => state.hasAccess);

  // Ask once on home load while no delivery/pickup choice is saved yet.
  // Choosing requires login, so guests aren't asked until they log in.
  useEffect(() => {
    if (isReady && hasAccess && !serviceType) setSelectionModal(true);
  }, [isReady, hasAccess, serviceType, setSelectionModal]);

  if (isError) {
    return <NotFound />;
  }
  return (
    <Suspense>
      <PageLayout>
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
export default Page;
