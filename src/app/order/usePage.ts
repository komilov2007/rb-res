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
import {
  cancelOrder,
  createOrder,
  type CreateOrderPayload,
  getPaymentToken,
} from "@/apis/order";
import { isServiceDelivery } from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import { getActiveCartCount } from "@/utils/cart";
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
  // Covers the token-fetch/invoice/openInvoice steps of the Telegram invoice
  // flow (Group B), which happen before createOrder is ever called, so
  // createOrderMutation.isPending alone doesn't cover the whole submit.
  const [isTelegramSubmitting, setIsTelegramSubmitting] = useState(false);
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

  // createOrderMutation's onError already shows the failure (submitError),
  // so a rejected mutateAsync only has to stop the flow here — uncaught it
  // was an unhandled promise rejection.
  const createAndHandleOrder = async (
    payload: CreateOrderPayload,
    values: OrderFormValues,
  ) => {
    const response = await createOrderMutation
      .mutateAsync(payload)
      .catch(() => null);

    if (!response) return;

    handleCreateOrderResponse(response.data, values);
  };

  // An order created for a Telegram invoice that then wasn't paid is cancelled
  // again, so no unpaid order is left behind for the restaurant.
  const cancelUnpaidOrderMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId, shopid as string),
  });

  // Group B (CLICK / PAYME via a Telegram invoice). Order FIRST, payment
  // second — same order as the redirect-based online payments: if the order
  // can't be created (error, unavailable items) the user is never charged.
  //   createOrder -> token -> Bot API createInvoiceLink (payload = our order)
  //   -> openInvoice -> paid: finish the order / not paid: cancel it.
  // There is no backend endpoint to mark an order paid or to refund, so
  // "paid" is only confirmed by Telegram's invoice status here.
  const submitViaTelegramInvoice = async (
    paymentType: TelegramInvoicePaymentType,
    payload: CreateOrderPayload,
    values: OrderFormValues,
  ) => {
    setIsTelegramSubmitting(true);

    try {
      // onError already shows the failure (submitError).
      const response = await createOrderMutation
        .mutateAsync(payload)
        .catch(() => null);

      if (!response) return;

      const order = response.data;

      // No order was placed (unavailable items) — nothing to pay for; the
      // usual unavailable-items modal handles it.
      if (order.unavailable_products?.length || !order.order) {
        handleCreateOrderResponse(order, values);
        return;
      }

      const cancelUnpaidOrder = async (reason: string) => {
        try {
          await cancelUnpaidOrderMutation.mutateAsync(order.order);
        } catch (error) {
          // The user wasn't charged, but an unpaid order is left behind —
          // say so, and keep the details for support.
          console.error("[order] unpaid Telegram-invoice order not cancelled", {
            orderId: order.order,
            paymentType,
            reason,
            error,
          });
          setSubmitError(
            t("order_page_errors_unpaid_order_left", { id: order.order }),
          );
          return false;
        }

        return true;
      };

      let status: Awaited<ReturnType<typeof openTelegramInvoice>>;

      try {
        const tokenResponse = await getPaymentToken(
          shopid as string,
          paymentType,
        );
        const { bot_token, payment } = tokenResponse.data;

        const invoice = await createTelegramInvoiceLink(bot_token, {
          title: t("order_page_invoice_title"),
          description: t("order_page_invoice_description", {
            id: order.order,
            count: cartCount,
          }),
          // Ties the Telegram payment to our order (1-128 bytes).
          payload: JSON.stringify({ order_id: order.order, shop: shopid }),
          provider_token: payment.token,
          currency: "UZS",
          prices: [
            { label: t("total"), amount: Math.round(displayTotal * 100) },
          ],
        });

        if (!invoice.ok || !invoice.result) {
          if (await cancelUnpaidOrder("invoice link failed")) {
            setSubmitError(t("order_page_errors_payment_link_failed"));
          }
          return;
        }

        status = await openTelegramInvoice(invoice.result);
      } catch (error) {
        if (await cancelUnpaidOrder("invoice step threw")) {
          setSubmitError(
            getApiErrorMessage(
              error,
              t("order_page_errors_payment_link_failed"),
            ),
          );
        }
        return;
      }

      // "pending": Telegram is still processing the payment — the order
      // stays; its page shows the real status.
      if (status === "paid" || status === "pending") {
        handleCreateOrderResponse(order, values);
        return;
      }

      if (await cancelUnpaidOrder(`invoice ${status ?? "unavailable"}`)) {
        setSubmitError(t("order_page_errors_payment_failed"));
      }
    } finally {
      setIsTelegramSubmitting(false);
    }
  };

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

    const nearBranch = isDeliveryOrder
      ? (nearestBranchQuery.data?.data.id ?? null)
      : values.branch;
    const service = availableServices.find(
      (item) => item.type === values.delivery_type,
    );

    const orderItems = getOrderItems(carts);

    if (orderItems.length === 0) {
      toast.error(t("order_page_errors_cart_empty"));
      return;
    }

    const payload = buildOrderPayload({
      values,
      isDeliveryOrder,
      nearBranch,
      shopid: shopId,
      customerId: customer,
      orderItems,
      hasShippingTime: Boolean(service?.shipping_time),
    });

    if (values.payment_type && isTelegramInvoicePaymentType(values.payment_type)) {
      await submitViaTelegramInvoice(values.payment_type, payload, values);
      return;
    }

    await createAndHandleOrder(payload, values);
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
