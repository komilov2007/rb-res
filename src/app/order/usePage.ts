"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useShopStatusStore } from "@/stores/shop-status";
import { useShopId } from "@/hooks/useShopId";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import {
  createOrder,
  getPaymentToken,
  type CreateOrderPayload,
} from "@/apis/order";
import { isServiceDelivery } from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import { getApiErrorMessage } from "@/utils/api-error";
import { useBranches } from "@/hooks/useBranches";
import {
  createTelegramInvoiceLink,
  openTelegramInvoice,
} from "@/utils/telegram";
import { TelegramInvoicePaymentType, isTelegramInvoicePaymentType } from "./constants";
import { buildOrderPayload, getOrderItems } from "./buildOrderPayload";
import { useOrderDelivery } from "./useOrderDelivery";
import { useOrderForm } from "./useOrderForm";
import { useOrderResponse } from "./useOrderResponse";
import { useOrderTotals } from "./useOrderTotals";
import { useUnavailableItems } from "./useUnavailableItems";

export const usePage = () => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const { data: general, refetch: refetchGeneral } = useGeneral();
  const openClosedModal = useShopStatusStore((state) => state.openClosedModal);
  const { data: profile } = useProfile();
  const customerId = useAuthStore((state) => state.auth?.customer);
  const carts = useCartStore((state) => state.carts);
  const cartCount = useCartStore((state) => state.cartCount);

  const {
    unavailable,
    setUnavailable,
    isUnavailableModalOpen,
    openUnavailableModal,
    closeUnavailableModal,
  } = useUnavailableItems();
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Covers the token-fetch/invoice/openInvoice steps of the Telegram invoice
  // flow (Group B), which happen before createOrder is ever called, so
  // createOrderMutation.isPending alone doesn't cover the whole submit.
  const [isTelegramSubmitting, setIsTelegramSubmitting] = useState(false);

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

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
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

  // Group B: token -> Telegram Bot API createInvoiceLink -> openInvoice ->
  // only createOrder (via handleCreateOrderResponse -> finishOrder) once the
  // invoice actually comes back paid.
  const submitViaTelegramInvoice = async (
    paymentType: TelegramInvoicePaymentType,
    payload: CreateOrderPayload,
    values: OrderFormValues,
  ) => {
    setIsTelegramSubmitting(true);

    try {
      const tokenResponse = await getPaymentToken(shopid as string, paymentType);
      const { bot_token, payment } = tokenResponse.data;

      const invoice = await createTelegramInvoiceLink(bot_token, {
        title: t("order_page_invoice_title"),
        description: "Test description",
        payload: "custom_payload",
        provider_token: payment.token,
        currency: "UZS",
        prices: [{ label: t("total"), amount: Math.round(displayTotal * 100) }],
      });

      if (!invoice.ok || !invoice.result) {
        setSubmitError(t("order_page_errors_payment_link_failed"));
        return;
      }

      const status = await openTelegramInvoice(invoice.result);

      if (status !== "paid") {
        setSubmitError(t("order_page_errors_payment_failed"));
        return;
      }

      const response = await createOrderMutation.mutateAsync(payload);

      handleCreateOrderResponse(response.data, values);
    } finally {
      setIsTelegramSubmitting(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!customerId || !shopid) return;

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

    const nearBranch = isDeliveryOrder
      ? (nearestBranchQuery.data?.data.id ?? null)
      : values.branch;
    const service = availableServices.find(
      (item) => item.type === values.delivery_type,
    );

    const orderItems = getOrderItems(carts, unavailableItemIds);

    if (orderItems.length === 0) {
      toast.error(t("order_page_errors_cart_empty"));
      return;
    }

    const payload = buildOrderPayload({
      values,
      isDeliveryOrder,
      nearBranch,
      shopid,
      customerId: Number(customerId),
      orderItems,
      hasShippingTime: Boolean(service?.shipping_time),
    });

    if (values.payment_type && isTelegramInvoicePaymentType(values.payment_type)) {
      await submitViaTelegramInvoice(values.payment_type, payload, values);
      return;
    }

    const response = await createOrderMutation.mutateAsync(payload);

    handleCreateOrderResponse(response.data, values);
  });

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
    hasShippingTime: Boolean(selectedService?.shipping_time),
    cashbackEnabled: general?.data?.cashback_enabled === true,
    onSubmit,
    isSubmitting: createOrderMutation.isPending || isTelegramSubmitting,
    unavailableItemIds,
    isUnavailableModalOpen,
    closeUnavailableModal,
    cartCount,
    cartTotal: totals.cartTotal,
    deliveryPrice: totals.orderDeliveryPrice,
    promoTotal: totals.appliedPromoTotal,
    unavailableTotal: totals.unavailableTotal,
    cashbackBall: totals.cashbackBall,
    oldPrice: totals.oldPrice,
    displayTotal,
    submitError,
  };
};
