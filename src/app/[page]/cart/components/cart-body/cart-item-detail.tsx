import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC } from "@/utils/image";
import { hasDiscount } from "@/utils/product";
import type { CartItemProps } from "@/types/cart";
import { getProductDetail } from "@/apis/products";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import {
  ProductDetailMedia,
  ProductParameter,
} from "@/components/modal/product-detail/components";
import {
  getOldPrice,
  stripHtml,
} from "@/components/modal/product-detail/utils";
import { SALE_VARIANT_CLASS_NAMES } from "@/components/card-product/utils";
import { getSaleLabel } from "./utils";

// Read-only view — the cart item's parameter is already fixed once it's in
// the cart, so unlike the full ProductDetailMobile (which owns its own
// Sheet/Dialog and an add-to-cart mutation flow) this only needs to reuse
// the media gallery + text formatting, not the whole parameter-selection or
// footer/mutation machinery. The back control lives in CartHeader's own
// header slot (swapped in by the parent), not here, so there's only ever
// one header shown at a time.
export const CartItemDetail = ({ item }: { item: CartItemProps }) => {
  const t = useTranslations();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const { data, isLoading } = useQuery({
    enabled: Boolean(item.product.id),
    queryKey: ["product-detail", item.product.id],
    queryFn: () => getProductDetail(item.product.id),
  });

  const detail = data?.data ?? item.product;
  const photos = data?.data.photos?.length
    ? data.data.photos
        .map((photo) => photo.photo)
        .filter((photo): photo is string => Boolean(photo))
    : [detail.photo].filter((photo): photo is string => Boolean(photo));
  const image = photos[activePhotoIndex] || photos[0] || IMAGE_PLACEHOLDER_SRC;
  const description = stripHtml(data?.data.desc || detail.description);
  const price = item.product.discount_price ?? item.product.price;
  const oldPrice = getOldPrice({
    price: detail.price,
    discountPrice: detail.discount_price,
    saleAmount: detail.sale_amount,
    saleType: detail.sale_type,
  });
  // Same discount-source fix as the row: use the fetched product detail,
  // not item.product (which the cart-list response never populates with
  // sale_type/sale_amount for an authenticated cart item).
  const isOnSale = Boolean(data?.data && hasDiscount(data.data));
  const saleLabel = data?.data ? getSaleLabel(data.data, t("sum")) : "";
  // The cart item only ever carries the selected sku's *name* (STEP 15),
  // never its id, so the read-only ProductParameter reuse below has to
  // match by name against the fetched product's real parameter/
  // additional_parameter definitions to know which option to highlight.
  const selectedMainSkuIds = data?.data.parameter?.skus
    ? data.data.parameter.skus
        .filter((sku) => sku.name === item.parameter?.name)
        .map((sku) => sku.id)
    : [];
  const selectedAdParameterNames = new Set(
    (item.ad_parameter ?? []).map((sku) => sku.name),
  );
  const hasParameters = Boolean(
    data?.data.parameter?.skus?.length ||
      data?.data.additional_parameter?.some((group) => group.skus?.length),
  );

  return (
    <div>
      {isLoading ? (
        <ProductDetailSkeleton />
      ) : (
        <>
          <ProductDetailMedia
            image={image}
            name={detail.name}
            photos={photos}
            activePhotoIndex={activePhotoIndex}
            hasDiscount={isOnSale}
            saleLabel={saleLabel}
            saleBadgeClassName={SALE_VARIANT_CLASS_NAMES.red.badge}
            onSelectPhoto={setActivePhotoIndex}
          />

          <div className="px-4 pb-5 pt-4">
            {detail.category?.name && (
              <span className="inline-flex rounded-lg bg-gray10 px-3 py-1 text-xs font-bold text-black">
                {detail.category.name}
              </span>
            )}

            <h2 className="mt-3 text-base font-medium leading-5 text-black">
              {detail.name}
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-lg font-bold text-black">
                {formatPrice(price)} {t("sum")}
              </p>
              {oldPrice && (
                <p className="text-sm font-normal leading-none text-red-500 line-through">
                  {formatPrice(oldPrice)} {t("sum")}
                </p>
              )}
            </div>

            {description && (
              <p className="mt-4 text-sm font-normal leading-5 text-gray220">
                {description}
              </p>
            )}

            {hasParameters && (
              <div className="mt-5 space-y-3 border-t border-gray180 pt-5">
                {data?.data.parameter?.skus?.length ? (
                  <ProductParameter
                    parameter={data.data.parameter}
                    selectedSkuIds={selectedMainSkuIds}
                    onSelect={() => {}}
                  />
                ) : null}

                {data?.data.additional_parameter?.map((group) => (
                  <ProductParameter
                    key={group.id}
                    parameter={group}
                    selectedSkuIds={group.skus
                      .filter((sku) => selectedAdParameterNames.has(sku.name))
                      .map((sku) => sku.id)}
                    onSelect={() => {}}
                    pricePrefix="+ "
                    multiple={group.type !== "single"}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
