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
import { getOldPrice, stripHtml } from "@/components/modal/product-detail/product-detail";
import { SALE_VARIANT_CLASS_NAMES } from "@/components/card-product/card-product";
import { getSaleLabel } from "./cart-item";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const CartItemDetail = ({ item }: { item: CartItemProps }) => {
  const t = useTranslations();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const { data, isLoading } = useQuery({
    enabled: Boolean(item.product.id),
    queryKey: [REACT_QUERY_KEYS.PRODUCT_DETAIL, item.product.id],
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
  const isOnSale = Boolean(data?.data && hasDiscount(data.data));
  const saleLabel = data?.data ? getSaleLabel(data.data, t("sum")) : "";
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
              <span className="inline-flex rounded-lg bg-gray10 px-3 py-1 text-xs font-medium text-black">
                {detail.category.name}
              </span>
            )}

            <h2 className="mt-3 text-base font-medium leading-5 text-black">
              {detail.name}
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-lg font-medium text-black">
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
