"use client";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProducts } from "@/apis/products";
import { getCategories } from "@/apis/categories";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { hasSearchValue } from "@/utils/search";
import { normalizeCategories } from "@/utils/product";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/utils/format-price";
import {
  IMAGE_PLACEHOLDER_SRC,
  getImageSrc,
  handleImageFallback,
} from "@/utils/image";
import { useProductDetailStore } from "@/stores/product-detail";
import { ChevronRight, PackageSearch, SearchX } from "lucide-react";
import { IconLayoutGridFilled, IconTagFilled } from "@tabler/icons-react";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

interface SearchModalProps {
  open: boolean;
  value: string;
  fullscreen?: boolean;
}

const SectionTitle = ({ children }: { children: string }) => (
  <p className="px-2 pb-1.5 pt-2 text-xs font-medium text-gray220">
    {children}
  </p>
);

// Tapping a product opens the exact same product-detail drawer the catalog's
// own card-product uses (src/components/modal/product-detail via
// useProductDetailStore) — not a separate page/view. Mounted once, globally,
// by PageLayout, so it's already reachable from wherever this renders. The
// host stays open underneath, so closing the drawer returns to the results.
// Tapping a category navigates to its own route instead.
const SearchModal = ({ open, value, fullscreen }: SearchModalProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid, hasShopId } = useShopId();
  const search = useDebounce(value);
  const hasSearch = hasSearchValue(search);
  const openProductDetail = useProductDetailStore(
    (state) => state.openProductDetail,
  );

  const { data, isLoading } = useQuery({
    enabled: open && hasShopId && hasSearch,
    queryKey: [REACT_QUERY_KEYS.SEARCH_PRODUCTS, shopid, search],
    queryFn: () => getProducts(shopid as string, { search }),
  });

  // Same queryKey as the home page's own category list — the backend has no
  // category search param, so the (already cached) full list is filtered
  // here by name.
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    enabled: open && hasShopId,
    queryKey: [REACT_QUERY_KEYS.CATEGORIES, shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const products = data?.data.results ?? [];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const categories = hasSearch
    ? normalizeCategories(categoriesData?.data).filter((category) =>
        category.name.toLocaleLowerCase().includes(normalizedSearch),
      )
    : [];
  const hasResults = products.length > 0 || categories.length > 0;

  const handleCategoryClick = (categoryId: number) => {
    router.push(
      `${ROUTER.CATEGORY}/${categoryId}${shopid ? `?shop_id=${shopid}` : ""}`,
    );
  };

  if (!open) return null;

  return (
    <div
      className={`w-full overscroll-contain overflow-hidden bg-white ${
        fullscreen
          ? "h-full flex-1 rounded-none border-0"
          : "h-[320px] rounded-xl border border-gray180"
      }`}
    >
      {!hasSearch ? (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray10 text-gray220">
            <PackageSearch size={24} />
          </div>
          <h4 className="title10 text-black">{t("search_products_title")}</h4>
          <p className="text20 mt-1">{t("search_products_hint")}</p>
        </div>
      ) : isLoading || isCategoriesLoading ? (
        // Same padding and row shape as the product results below.
        <ul
          aria-label={t("searching")}
          className="h-full overflow-hidden p-2"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 p-2">
              <span className="skeleton h-15 w-15 shrink-0 rounded-lg" />
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="skeleton h-4 w-3/5 rounded-full" />
                <span className="skeleton h-3 w-2/5 rounded-full" />
              </span>
              <span className="skeleton h-4 w-16 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      ) : hasResults ? (
        <div className="h-full overscroll-contain overflow-y-auto p-2">
          {categories.length > 0 && (
            <>
              <SectionTitle>{t("search_categories")}</SectionTitle>
              <ul className="flex flex-col gap-1.5">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors active:bg-gray10"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-gray220">
                        {category.photo ? (
                          <img
                            src={getImageSrc(category.photo)}
                            alt=""
                            onError={handleImageFallback}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <IconLayoutGridFilled size={17} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="info-label line-clamp-1">
                          {category.name}
                        </span>
                        <span className="info-value block">
                          {t("cart_product_count", {
                            count: category.products_count,
                          })}
                        </span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-gray220" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {products.length > 0 && (
            <>
              <SectionTitle>{t("search_products_section")}</SectionTitle>
              <ul>
                {products.map((product) => {
                  const price = product.discount_price ?? product.price;

                  return (
                    <li key={product.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => openProductDetail(product)}
                        className="h-auto w-full justify-start gap-3 rounded-lg p-2 text-left"
                      >
                        <span className="flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray10">
                          <img
                            src={product.photo || IMAGE_PLACEHOLDER_SRC}
                            alt={product.name}
                            onError={handleImageFallback}
                            className="h-full w-full object-cover"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="info-label line-clamp-1">
                            {product.name}
                          </span>
                          <span className="info-value flex items-center gap-1">
                            <IconTagFilled size={13} />
                            <span className="line-clamp-1">
                              {product.category?.name}
                            </span>
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-black">
                          {formatPrice(price)} {t("sum")}
                        </span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow10 text-yellow">
            <SearchX size={24} />
          </div>
          <h4 className="title10 text-black">{t("product_not_found")}</h4>
          <p className="text20 mt-1">{t("try_another_name")}</p>
        </div>
      )}
    </div>
  );
};

export default SearchModal;
