"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { Suspense, useEffect, useState } from "react";
import { ChevronLeft, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import MobileFooter from "@/components/mobile-footer";

import { BranchSelectionModal } from "@/components/branch-selection/branch-selection-modal";
import Breadcrumb from "@/components/breadcrumb";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Button from "@/components/ui/button";
import { CategoryTileSkeleton } from "@/components/ui/skeleton";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import { normalizeCategories } from "@/utils/product";
import { useBoolean } from "@/hooks/useBoolean";
import { useUiStore } from "@/stores/ui";
import AllProducts from "./components/all-products";
import { MobileSearchScreen } from "@/app/components/banner/components";

const GRID_CLASS_NAME =
  "grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-5";

const CategoriesContent = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const { data, isLoading } = useShopCategories();

  const categories = normalizeCategories(data?.data);
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";

  const searchModal = useBoolean();
  const [searchValue, setSearchValue] = useState("");
  const setMobileHeaderDrawerOpen = useUiStore(
    (state) => state.setMobileHeaderDrawerOpen,
  );

  useEffect(() => {
    setMobileHeaderDrawerOpen(searchModal.value);

    return () => setMobileHeaderDrawerOpen(false);
  }, [searchModal.value, setMobileHeaderDrawerOpen]);

  const handleCloseSearch = () => {
    searchModal.setFalse();
    setSearchValue("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray10 pb-[calc(74px+var(--safe-bottom))] lg:pb-0">
      <Header pinBottomRow />

      <div className="sticky top-0 z-30 rounded-b-2xl border-b border-gray180 bg-white pt-[var(--safe-top)] lg:hidden">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.push(`${ROUTER.HOME}${shopQuery}`)}
            aria-label={t("common_back")}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="min-w-0 flex-1 truncate text-base font-medium text-black">
            {t("search_categories")}
          </h1>
          <Button
            type="button"
            variant="icon-solid"
            size="icon-lg"
            onClick={searchModal.setTrue}
            aria-label={t("search_products")}
            className="-my-1.5 shrink-0 bg-gray10 text-gray220"
          >
            <SearchIcon size={20} />
          </Button>
        </div>
      </div>

      <Breadcrumb items={[{ label: t("catalog_all_categories") }]} />

      <div
        className={`flex w-full flex-col bg-gray10 lg:mt-2 lg:rounded-[30px] lg:bg-white ${
          categories.length > 0 ? "" : "flex-1"
        }`}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col px-4 pb-4 pt-4 lg:max-w-7xl lg:px-5 lg:py-6">
          <h2 className="mb-6 hidden text-xl font-medium text-black lg:block">
            {t("catalog_all_categories")}
          </h2>

          {isLoading ? (
            <div className={GRID_CLASS_NAME}>
              {Array.from({ length: 12 }).map((_, index) => (
                <CategoryTileSkeleton key={index} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="py-10 text-center text-sm font-normal text-gray220">
              {t("catalog_not_found")}
            </p>
          ) : (
            <div className={GRID_CLASS_NAME}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`${ROUTER.CATEGORY}/${category.id}${shopQuery}`}
                  className="group relative flex aspect-square w-full items-end overflow-hidden rounded-xl bg-gray10 p-2 text-white transition-transform duration-300 active:scale-[0.98] lg:rounded-2xl lg:p-3"
                >
                  <img
                    src={getImageSrc(category.photo)}
                    alt={category.name}
                    onError={handleImageFallback}
                    className="absolute inset-0 h-full w-full object-cover brightness-75 transition-transform duration-500 lg:group-hover:scale-105"
                  />
                  <span className="relative z-10 line-clamp-2 w-full text-center text-xs font-medium leading-tight text-white drop-shadow-sm lg:text-sm">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex-1 lg:pb-6">
          <AllProducts categoryIds={categories.map((category) => category.id)} />
        </div>
      )}

      <MobileSearchScreen
        open={searchModal.value}
        value={searchValue}
        placeholder={t("search_food_or_category")}
        onClose={handleCloseSearch}
        onClear={() => setSearchValue("")}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      <Footer />
      <MobileFooter />
      <BranchSelectionModal />
    </div>
  );
};

const Categories = () => (
  <Suspense>
    <CategoriesContent />
  </Suspense>
);

export default Categories;
