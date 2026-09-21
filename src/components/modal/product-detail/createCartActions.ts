"use client";

import { getCartList } from "@/apis/cart";
import { useCartStore } from "@/stores/cart";
import type { ProductParameterProps } from "@/types/product";
import { normalizeCartItems } from "@/utils/cart";
import { showProductUnavailable } from "@/utils/branch-availability";
import type { ProductDetailViewContext } from "./createSheetActions";
import type { createSheetActions } from "./createSheetActions";

export type ProductDetailActionContext = ProductDetailViewContext &
  ReturnType<typeof createSheetActions>;

// Parameter selection and every cart change made from the detail view.
export const createCartActions = (ctx: ProductDetailActionContext) => {
  const {
    carts,
    setCarts,
    customerId,
    setLoginModal,
    queryClient,
    setSkuState,
    setParameterErrorState,
    requiredParameterRef,
    dragDeltaY,
    stockMutation,
    detail,
    selectedParameterSkuId,
    hasRequiredParameter,
    selectedAdditionalSkus,
    cartItem,
    quantity,
    branchId,
    isUnavailableInBranch,
    closeDetail,
  } = ctx;

  const refreshCartList = async () => {
    if (!customerId) return;

    const cartListResponse = await queryClient.fetchQuery({
      queryKey: ["cart-list", customerId],
      queryFn: () => getCartList(customerId),
      staleTime: 0,
    });

    setCarts(
      normalizeCartItems(cartListResponse.data, useCartStore.getState().carts),
    );
    await queryClient.invalidateQueries({
      queryKey: ["cart-list", customerId],
    });
  };

  const syncParameterCart = async (nextQuantity: number) => {
    if (!customerId) return;

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
    const quantityValue = Number(value.replace(/\D/g, "").slice(0, 3));

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
    // Adding to the cart requires login. The drawer is closed first — the
    // login modal stacked on top of this open Sheet wasn't usable.
    if (!customerId) {
      closeDetail();
      setLoginModal(true);
      return false;
    }

    if (isUnavailableInBranch) {
      showProductUnavailable();
      return false;
    }

    if (!validateRequiredParameter()) return false;

    const nextQuantity = cartItem ? quantity + 1 : 1;
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
