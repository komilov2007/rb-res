"use client";

import { type BaseSyntheticEvent, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useShopStatusStore } from "@/stores/shop-status";
import { useShopId } from "@/hooks/useShopId";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { createOrder, type CreateOrderPayload } from "@/apis/order";
import { isServiceDelivery } from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import { getActiveCartCount } from "@/utils/cart";
import { getApiErrorMessage } from "@/utils/api-error";
import { useBranches } from "@/hooks/useBranches";
import { isTelegramInvoicePaymentType } from "./constants";
import { buildOrderPayload, getOrderItems } from "./buildOrderPayload";
import { useInvalidateOrderDomains } from "./useInvalidateOrderDomains";
import { useOrderDelivery } from "./useOrderDelivery";
import { useOrderForm } from "./useOrderForm";
import { useOrderResponse } from "./useOrderResponse";
import { useOrderTotals } from "./useOrderTotals";
import { useTelegramInvoice } from "./useTelegramInvoice";
import { useUnavailableItems } from "./useUnavailableItems";

export const usePage = () => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const {
    data: general,
    isLoading: isGeneralLoading,
    refetch: refetchGeneral,
  } = useGeneral();
  const openClosedModal = useShopStatusStore((state) => state.openClosedModal);
  const { data: profile } = useProfile();
  const customerId = useAuthStore((state) => state.auth?.customer);
  const carts = useCartStore((state) => state.carts);
  // Active lines only — the same lines the totals and createOrder use.
  const cartCount = getActiveCartCount(carts);

  const {
    unavailable,
    setUnavailable,
    isUnavailableModalOpen,
    openUnavailableModal,
    closeUnavailableModal,
  } = useUnavailableItems();
  const [submitError, setSubmitError] = useState<string | null>(null);
  // The button only disables after a re-render, and onSubmit awaits the
  // general refetch before any mutation is pending — this blocks a second
  // submit (a duplicate order) in that window.
  const isSubmittingRef = useRef(false);

  const {
    form,
    deliveryType,
    addressValue,
    availableServices,
    selectedService,
    isDelivery,
    isProvider,
    totalsInput,
  } = useOrderForm(general?.data?.services);

  const totals = useOrderTotals({
    ...totalsInput,
    carts,
    unavailable,
    isDelivery,
    general,
    profile,
  });
  const { unavailableItemIds, displayTotal } = totals;

  const branchesQuery = useBranches();

  const { isAddressDeliverable, nearestBranchQuery } = useOrderDelivery({
    form,
    deliveryType,
    addressValue,
    isDelivery,
    isProvider,
    cartTotal: totals.cartTotal,
    availableServices,
    selectedService,
  });

  const invalidateOrderDomains = useInvalidateOrderDomains();

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: invalidateOrderDomains,
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(error, t("order_page_errors_create_failed")),
      );
    },
  });

  const { handleCreateOrderResponse } = useOrderResponse({
    unavailableItemIds,
    setUnavailable,
    openUnavailableModal,
  });

  // createOrderMutation's onError already shows the failure (submitError),
  // so a rejected mutateAsync only has to stop the flow here — uncaught it
  // was an unhandled promise rejection.
  const createOrderSafely = (payload: CreateOrderPayload) =>
    createOrderMutation.mutateAsync(payload).catch(() => null);

  // Group B (CLICK / PAYME via a Telegram invoice) — see useTelegramInvoice.
  const { submitViaTelegramInvoice, isTelegramSubmitting } =
    useTelegramInvoice({
      createOrderSafely,
      handleCreateOrderResponse,
      setSubmitError,
      cartCount,
      displayTotal,
    });

  const submitOrder = async (
    values: OrderFormValues,
    shopId: string,
    customer: number,
  ) => {
    setSubmitError(null);

    // Fresh is_open, not the cached one — the shop may have closed since
    // this page loaded. Same closed-shop modal the cart's checkout opens.
    const { data: freshGeneral } = await refetchGeneral();

    if (freshGeneral?.data.is_open === false) {
      openClosedModal();
      return;
    }

    const isDeliveryOrder = isServiceDelivery(values.delivery_type);

    // The message itself is shown only in the address section.
    if (isDeliveryOrder && !isAddressDeliverable) return;

    const orderItems = getOrderItems(carts);

    if (orderItems.length === 0) {
      toast.error(t("order_page_errors_cart_empty"));
      return;
    }

    const service = availableServices.find(
      (item) => item.type === values.delivery_type,
    );
    const payload = buildOrderPayload({
      values,
      isDeliveryOrder,
      nearBranch: isDeliveryOrder
        ? (nearestBranchQuery.data?.data.id ?? null)
        : values.branch,
      shopid: shopId,
      customerId: customer,
      orderItems,
      hasShippingTime: Boolean(service?.shipping_time),
    });

    if (values.payment_type && isTelegramInvoicePaymentType(values.payment_type)) {
      await submitViaTelegramInvoice(values.payment_type, payload, values);
      return;
    }

    const response = await createOrderSafely(payload);

    if (response) handleCreateOrderResponse(response.data, values);
  };

  const submitValues = async (values: OrderFormValues) => {
    if (!customerId || !shopid || isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    try {
      await submitOrder(values, shopid, Number(customerId));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // handleSubmit is called inside the handler (not during render) so the
  // ref above is only ever read in an event.
  const onSubmit = (event?: BaseSyntheticEvent) =>
    form.handleSubmit(submitValues)(event);

  return {
    form,
    branches: branchesQuery.data?.data,
    isBranchesLoading: branchesQuery.isLoading,
    isBranchesError: branchesQuery.isError,
    // Branch working hours aren't per-branch — they come from the shop-wide
    // schedule already fetched here (same field src/utils/banner.ts already
    // reads for the "today's hours" banner text).
    workingTime: general?.data?.working_time,
    availableServices,
    isServicesLoading: isGeneralLoading,
    hasShippingTime: Boolean(selectedService?.shipping_time),
    cashbackEnabled: general?.data?.cashback_enabled === true,
    onSubmit,
    // formState.isSubmitting also covers the fresh-general refetch that runs
    // before the mutation is pending.
    isSubmitting:
      form.formState.isSubmitting ||
      createOrderMutation.isPending ||
      isTelegramSubmitting,
    unavailableItemIds,
    isUnavailableModalOpen,
    closeUnavailableModal,
    cartCount,
    cartTotal: totals.cartTotal,
    deliveryPrice: totals.orderDeliveryPrice,
    promoTotal: totals.appliedPromoTotal,
    cashbackBall: totals.cashbackBall,
    oldPrice: totals.oldPrice,
    displayTotal,
    submitError,
  };
};
