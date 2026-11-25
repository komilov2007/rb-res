"use client";

import type { ProductParameterProps } from "@/types/product";
import { showProductUnavailable } from "@/utils/branch-availability";
import type { ProductDetailViewContext } from "./createSheetActions";
import type { createSheetActions } from "./createSheetActions";

export type ProductDetailActionContext = ProductDetailViewContext &
  ReturnType<typeof createSheetActions>;

export const createCartActions = (ctx: ProductDetailActionContext) => {
  const {
    carts,
    setCarts,
    customerId,
    product,
    refreshCart,
    setSkuState,
    setParameterErrorState,
    requiredParameterRef,
    dragDeltaY,
    stockMutation,
    detail,
    selectedParameterSkuId,
    selectedParameterSku,
    hasRequiredParameter,
    selectedAdditionalSkus,
    cartItem,
    quantity,
    maxQuantity,
    isSoldOut,
    branchId,
    isUnavailableInBranch,
    closeDetail,
  } = ctx;

  const refreshCartList = refreshCart;

  const syncParameterCart = async (nextQuantity: number) => {
    // Mehmon: savat qatori qurilmada (persist qilingan store) yangilanadi
    if (!customerId) {
      const others = cartItem
        ? carts.filter((item) => item !== cartItem)
        : carts;
      const line = cartItem ?? {
        product,
        parameter: selectedParameterSku ?? null,
        ad_parameter: selectedAdditionalSkus,
      };

      setCarts(
        nextQuantity > 0
          ? [...others, { ...line, quantity: nextQuantity }]
          : others,
      );
      return;
    }

    await stockMutation.mutateAsync({
      customerId,
      data: {
        product: detail.id,
        quantity: nextQuantity,
        parameter: selectedParameterSkuId,
        ad_parameter: selectedAdditionalSkus.map((sku) => sku.id),
        branch_id: branchId ? String(branchId) : undefined,
      },
    });

    void refreshCartList();
  };

  const handleChangeQuantity = async (value: string) => {
    const quantityValue = Math.min(
      Number(value.replace(/\D/g, "").slice(0, 3)),
      maxQuantity,
    );

    if (!quantityValue || quantityValue < 1) return;
    if (isUnavailableInBranch) {
      showProductUnavailable();
      return;
    }
    if (!validateRequiredParameter()) return;

    await syncParameterCart(quantityValue);
  };

  const handleSelectParameter = (skuId: number) => {
    setParameterErrorState({
      productId: detail.id,
      show: false,
    });
    setSkuState((state) => ({
      productId: detail.id,
      parameterSkuId: skuId,
      additionalSkuIds:
        state.productId === detail.id ? state.additionalSkuIds : {},
    }));
  };

  const handleSelectAdditionalParameter = (
    parameter: ProductParameterProps,
    skuId: number,
  ) => {
    const isSingle = parameter.type === "single";

    setSkuState((state) => {
      const currentAdditionalSkuIds =
        state.productId === detail.id ? state.additionalSkuIds : {};
      const currentSelectedSkuIds = currentAdditionalSkuIds[parameter.id] ?? [];
      const nextSelectedSkuIds = isSingle
        ? [skuId]
        : currentSelectedSkuIds.includes(skuId)
          ? currentSelectedSkuIds.filter((id) => id !== skuId)
          : [...currentSelectedSkuIds, skuId];

      return {
        productId: detail.id,
        parameterSkuId:
          state.productId === detail.id ? state.parameterSkuId : undefined,
        additionalSkuIds: {
          ...currentAdditionalSkuIds,
          [parameter.id]: nextSelectedSkuIds,
        },
      };
    });
  };

  const validateRequiredParameter = () => {
    if (!hasRequiredParameter || selectedParameterSkuId) return true;

    setParameterErrorState({
      productId: detail.id,
      show: true,
    });
    requiredParameterRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return false;
  };

  const handleAdd = async () => {
    if (isUnavailableInBranch) {
      showProductUnavailable();
      return false;
    }

    if (!validateRequiredParameter()) return false;

    if (isSoldOut || maxQuantity < 1) return false;

    const nextQuantity = cartItem ? quantity + 1 : 1;
    if (nextQuantity > maxQuantity) return true;
    await syncParameterCart(nextQuantity);

    return true;
  };

  const handleDecrementDetail = async () => {
    if (!cartItem) return;

    if (!customerId) {
      setCarts(
        carts
          .map((item) =>
            item.product.id === detail.id
              ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
      return;
    }

    const nextQuantity = Math.max(quantity - 1, 0);
    await syncParameterCart(nextQuantity);
  };

  const handleAddAndClose = async () => {
    if (await handleAdd()) closeDetail();
  };
  const dragExpandOffset = Math.max(0, -dragDeltaY);

  return {
    refreshCartList,
    syncParameterCart,
    handleChangeQuantity,
    handleSelectParameter,
    handleSelectAdditionalParameter,
    validateRequiredParameter,
    handleAdd,
    handleDecrementDetail,
    handleAddAndClose,
    dragExpandOffset,
  };
};
