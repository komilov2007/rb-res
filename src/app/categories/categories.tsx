"use client";

import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import MobileFooter from "@/app/[page]/components/mobile/mobile-footer";

import Footer from "@/app/[page]/components/footer";
import Header from "@/app/[page]/components/header";
import { getCategories } from "@/apis/categories";
import Button from "@/components/ui/button";
import { CategoryTileSkeleton } from "@/components/ui/skleton";
import { ROUTER } from "@/constants/router";
import { useShopid } from "@/hooks/useShopId";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import { normalizeCategories } from "@/utils/product";

// Every category as a tile in the home categories' style (photo with a
// darkened overlay and the name on top). Tapping one opens its product page.
const CategoriesContent = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid, hasShopId } = useShopid();
  // Same query as the home categories strip, so the list is shared/cached.
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const categories = normalizeCategories(data?.data);
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";

  return (
    <div className="flex min-h-screen flex-col bg-gray10 pb-[74px] lg:pb-0">
      {/* pinBottomRow: only the bottom row pins on scroll — see the same
          fix (and its explanation) in category.tsx. */}
      <div className="hidden lg:block">
        <Header pinBottomRow />
      </div>

      {/* Same header as the category and "Buyurtmalarim" pages — mobile only,
          desktop gets the breadcrumb bar below instead. */}
      <div className="sticky top-0 z-30 rounded-b-2xl border-b border-gray180 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
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
          <h1 className="min-w-0 truncate text-base font-extrabold text-black">
            {t("search_categories")}
          </h1>
        </div>
      </div>

      {/* Full-bleed white bar, same pattern as Header/Footer: the bar spans
          edge to edge, an inner max-w-7xl wrapper centers the links. */}
      <div className="hidden w-full border-b border-gray180 bg-white lg:block">
        <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 px-5 py-4 text-xs text-gray220">
          <Link
            href={`${ROUTER.HOME}${shopQuery}`}
            className="flex items-center gap-1.5 font-medium hover:text-black"
          >
            <Home size={14} />
            {t("catalog.home")}
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-black">
            {t("catalog.all_categories")}
          </span>
        </nav>
      </div>

      {/* bg-white + edge-to-edge only on desktop: on mobile this stays plain
          (no boxed panel), matching how it always looked there. */}
      <div className="flex w-full flex-1 flex-col bg-gray10 lg:bg-white">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-4 pt-4 lg:max-w-7xl lg:px-5 lg:py-8">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <CategoryTileSkeleton key={index} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-gray220">
              {t("catalog.not_found")}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  data-category-tile={category.id}
                  onClick={() =>
                    router.push(`${ROUTER.CATEGORY}/${category.id}${shopQuery}`)
                  }
                  className="relative flex aspect-square w-full items-end overflow-hidden rounded-xl bg-gray10 p-2 text-white transition-transform duration-300 active:scale-[0.98] lg:rounded-2xl lg:p-3"
                >
                  <img
                    src={getImageSrc(category.photo)}
                    alt={category.name}
                    onError={handleImageFallback}
                    className="absolute inset-0 h-full w-full object-cover brightness-75"
                  />
                  <span className="relative z-10 line-clamp-2 w-full text-center text-xs font-medium leading-tight drop-shadow-sm lg:text-sm">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      {/* Bottom nav stays visible here too (these pages don't use PageLayout). */}
      <MobileFooter />
    </div>
  );
};

// useSearchParams (shop_id) needs a Suspense boundary.
const Categories = () => (
  <Suspense>
    <CategoriesContent />
  </Suspense>
);

export default Categories;
