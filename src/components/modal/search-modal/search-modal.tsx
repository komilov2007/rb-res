"use client";
import Button from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getProducts } from "@/apis/products";
import { useShopid } from "@/hooks/useShopId";
import { hasSearchValue } from "@/utils/search";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/utils/format-price";
import { PackageSearch, SearchX, Tag } from "lucide-react";

interface SearchModalProps {
  open: boolean;
  value: string;
  fullscreen?: boolean;
}

const SearchModal = ({ open, value, fullscreen }: SearchModalProps) => {
  const t = useTranslations();
  const { shopid, hasShopId } = useShopid();
  const search = useDebounce(value);
  const hasSearch = hasSearchValue(search);

  const { data, isLoading } = useQuery({
    enabled: open && hasShopId && hasSearch,
    queryKey: ["search-products", shopid, search],
    queryFn: () => getProducts(shopid as string, { search }),
  });

  const products = data?.data.results ?? [];
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
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary10 text-primary">
            <PackageSearch size={24} />
          </div>
          <h4 className="title10 text-black">{t("search_products_title")}</h4>
          <p className="text20 mt-1">{t("search_products_hint")}</p>
        </div>
      ) : isLoading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray180 border-t-primary" />
          <p className="text10">{t("searching")}</p>
        </div>
      ) : products.length > 0 ? (
        <ul className="h-full overscroll-contain overflow-y-auto p-2">
          {products.map((product) => {
            const price = product.discount_price ?? product.price;

            return (
              <li key={product.id}>
                <Button
                  variant="ghost"
                  size="md"
                  className="h-auto w-full justify-start gap-3 rounded-lg p-2 text-left"
                >
                  <span className="flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray10">
                    <img
                      src={product.photo}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-semibold text-black">
                      {product.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs font-medium text-gray220">
                      <Tag size={13} />
                      <span className="line-clamp-1">
                        {product.category?.name}
                      </span>
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
                    {formatPrice(price)} {t("sum")}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
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
