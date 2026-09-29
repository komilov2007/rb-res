"use client";

import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import MobileFooter from "@/components/mobile-footer";

import BranchSelectionModal from "@/components/branch-selection/branch-selection-modal";
import FloatingCart from "@/components/floating-cart";
import Footer from "@/components/footer";
import Header from "@/components/header";
import CardProduct from "@/components/card-product";
import ProductBranchPicker from "@/components/modal/product-branch-picker";
import ProductDetailMobile from "@/components/modal/product-detail";
import Button from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";

import DesktopView from "./components/desktop-view";
import { useCategory } from "./useCategory";

// Same card skeleton as the home product grid, in this page's 2-column grid.
const CategorySkeleton = () => (
  <div className="grid grid-cols-2 gap-1.75">
    {Array.from({ length: 6 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Same page shell and header as "Buyurtmalarim" (my-orders): a plain back +
// title bar, no address/branch selector.
const CategoryContent = () => {
  const t = useTranslations();
  const router = useRouter();
  const category = useCategory();
  const {
    shopid,
    categoryName,
    products,
    isUnavailable,
    hasBranch,
    availableCount,
    isLoading,
  } = category;

  const handleBack = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray10 pb-[74px] lg:pb-0">
      {/* pinBottomRow: only the bottom row (logo/search/cart) pins on
          scroll and drops its own bottom border, so it sits flush against
          the breadcrumb bar below. The topbar above it (phone/branches/
          language) is untouched and scrolls away normally. Every Header row
          is `hidden lg:*`, so this renders nothing on mobile. */}
      <Header pinBottomRow />

      {/* Sticky (not fixed): the header keeps its own space in the layout, so
          the grid always starts below it whatever its real height is (larger
          system/Telegram text grows it). z-30 keeps it above the cards'
          z-10/z-20 image and badges while they scroll under it. Desktop gets
          its own breadcrumb inside DesktopView below, so this is mobile-only. */}
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

      {/* Mobile-only: same narrow centered column as before. Bottom spacing
          matches the grid's row gap (16px). */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-4 pt-4 lg:hidden">
        {isLoading ? (
          <CategorySkeleton />
        ) : products.length === 0 ? (
          <p className="py-10 text-center text-sm font-normal text-gray220">
            {t("catalog_empty_category")}
          </p>
        ) : (
          <>
            {hasBranch && availableCount === 0 && (
              <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-center text-sm font-normal text-gray220">
                {t("catalog_empty_at_branch")}
              </p>
            )}
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
          </>
        )}
      </div>

      {/* Desktop-only: rendered unconstrained (not inside a max-w-7xl/px-5
          wrapper) so its own panels can bleed their white background all
          the way to the viewport edges — see desktop-view.tsx. */}
      <DesktopView {...category} />

      <Footer />
      {/* Same desktop cart shortcut as on home (PageLayout). */}
      <FloatingCart />
      <ProductDetailMobile />
      {/* Bottom nav stays visible here too (these pages don't use PageLayout). */}
      <MobileFooter />
      {/* Mounted here for the same reason PageLayout mounts them on other
          pages: the desktop header chip opens the selection modal, and the
          product detail's "choose another branch" opens the branch picker. */}
      <BranchSelectionModal />
      <ProductBranchPicker />
    </div>
  );
};

// useParams/useSearchParams need a Suspense boundary for a dynamic route.
const Category = () => (
  <Suspense>
    <CategoryContent />
  </Suspense>
);

export default Category;
