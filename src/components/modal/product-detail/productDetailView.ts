"use client";

import { getCartBranchId } from "@/utils/cart";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC } from "@/utils/image";
import { getOldPrice, stripHtml } from "./utils";
import type { useProductDetailBase } from "./useProductDetailBase";

export type ProductDetailBaseContext = Omit<ReturnType<typeof useProductDetailBase>, "product"> & {
  product: NonNullable<ReturnType<typeof useProductDetailBase>["product"]>;
};

// Everything derived from the loaded detail + current selection: photos,
// prices, the cart line, availability and badges.
export const getProductDetailView = (ctx: ProductDetailBaseContext) => {
  const {
    t,
    product,
    saleBadgeVariant,
    carts,
    selectedBranchId,
    photoState,
    skuState,
    parameterErrorState,
    data,
    stockMutation,
  } = ctx;

  const detail = data?.data ?? product;
  const photos = data?.data.photos?.length
    ? data.data.photos
        .map((item) => item.photo)
        .filter((photo): photo is string => Boolean(photo))
    : [detail.photo].filter((photo): photo is string => Boolean(photo));
  const activePhotoIndex =
    photoState.productId === detail.id ? photoState.index : 0;
  const image = photos[activePhotoIndex] || photos[0] || IMAGE_PLACEHOLDER_SRC;
  const description = stripHtml(data?.data.desc || detail.description);
  const unit = data?.data.unit?.unit || data?.data.unit?.name;
  const selectedParameterSkuId =
    skuState.productId === detail.id ? skuState.parameterSkuId : undefined;
  const selectedParameterSku = data?.data.parameter?.skus?.find(
    (sku) => sku.id === selectedParameterSkuId,
  );
  const hasRequiredParameter = Boolean(data?.data.parameter?.skus?.length);
  const selectedAdditionalSkuIds =
    skuState.productId === detail.id ? skuState.additionalSkuIds : {};
  const selectedAdditionalSkus =
    data?.data.additional_parameter?.flatMap((parameter) =>
      parameter.skus.filter((sku) =>
        selectedAdditionalSkuIds[parameter.id]?.includes(sku.id),
      ),
    ) ?? [];
  const price = detail.discount_price ?? detail.price;
  const selectedParameterPrice = selectedParameterSku?.price ?? 0;
  const selectedAdditionalPrice = selectedAdditionalSkus.reduce(
    (total, sku) => total + (sku.price ?? 0),
    0,
  );
  const totalItemPrice =
    price + selectedParameterPrice + selectedAdditionalPrice;
  const oldPrice = getOldPrice({
    price: detail.price,
    discountPrice: detail.discount_price,
    saleAmount: detail.sale_amount,
    saleType: detail.sale_type,
  });
  // The line for exactly the selected combination — not just any line of
  // this product. Matching on product alone picked up another parameter's
  // line, so adding a new parameter sent that line's quantity + 1 (e.g. 3
  // instead of 1). Cart lines carry sku names only (no ids), so match names.
  const selectedAdditionalNames = selectedAdditionalSkus
    .map((sku) => sku.name)
    .sort()
    .join(",");
  const cartItem = carts.find(
    (item) =>
      item.product.id === detail.id &&
      (item.parameter?.name ?? null) === (selectedParameterSku?.name ?? null) &&
      (item.ad_parameter ?? [])
        .map((sku) => sku.name)
        .sort()
        .join(",") === selectedAdditionalNames,
  );
  const quantity = cartItem?.quantity ?? 0;
  const totalPrice = totalItemPrice * (quantity || 1);
  const branchId = getCartBranchId(detail.branches, selectedBranchId);
  const isStockLoading = stockMutation.isPending;
  const showParameterError =
    parameterErrorState.productId === detail.id && parameterErrorState.show;
  const hasDiscount = Boolean(detail.discount_price || detail.sale_amount);
  // Not sold at the branch selected on home — adding is blocked.
  const isUnavailableInBranch =
    selectedBranchId !== null && !detail.branches?.includes(selectedBranchId);
  const hasParameters = Boolean(
    data?.data.parameter?.skus?.length ||
    data?.data.additional_parameter?.some((item) => item.skus?.length),
  );
  const saleLabel =
    detail.sale_type === "PERCENT"
      ? `-${detail.sale_amount}%`
      : `-${formatPrice(detail.sale_amount ?? 0)} ${t("sum")}`;
  const saleBadgeClassName = {
    primary: "bg-primary",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
  }[saleBadgeVariant ?? "orange"];

  return {
    detail,
    photos,
    activePhotoIndex,
    image,
    description,
    unit,
    selectedParameterSkuId,
    selectedParameterSku,
    hasRequiredParameter,
    selectedAdditionalSkuIds,
    selectedAdditionalSkus,
    price,
    selectedParameterPrice,
    selectedAdditionalPrice,
    totalItemPrice,
    oldPrice,
    cartItem,
    quantity,
    totalPrice,
    branchId,
    isStockLoading,
    showParameterError,
    hasDiscount,
    isUnavailableInBranch,
    hasParameters,
    saleLabel,
    saleBadgeClassName,
  };
};
