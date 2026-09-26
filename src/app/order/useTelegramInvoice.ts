"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useShopId } from "@/hooks/useShopId";
import {
  cancelOrder,
  type createOrder,
  type CreateOrderPayload,
  type CreateOrderResponse,
  getPaymentToken,
} from "@/apis/order";
import type { OrderFormValues } from "@/types/order";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  createTelegramInvoiceLink,
  openTelegramInvoice,
} from "@/utils/telegram";
import type { TelegramInvoicePaymentType } from "./constants";
import { useInvalidateOrderDomains } from "./useInvalidateOrderDomains";

type UseTelegramInvoiceProps = {
  // usePage's createOrder mutation; resolves null when it failed (its
  // onError already set submitError).
  createOrderSafely: (
    payload: CreateOrderPayload,
  ) => Promise<Awaited<ReturnType<typeof createOrder>> | null>;
  handleCreateOrderResponse: (
    order: CreateOrderResponse,
    values: OrderFormValues,
  ) => void;
  setSubmitError: (message: string | null) => void;
  cartCount: number;
  displayTotal: number;
};

// Group B (CLICK / PAYME via a Telegram invoice). Order FIRST, payment
// second — same order as the redirect-based online payments: if the order
// can't be created (error, unavailable items) the user is never charged.
//   createOrder -> token -> Bot API createInvoiceLink (payload = our order)
//   -> openInvoice -> paid: finish the order / not paid: cancel it.
// There is no backend endpoint to mark an order paid or to refund, so
// "paid" is only confirmed by Telegram's invoice status here.
export const useTelegramInvoice = ({
  createOrderSafely,
  handleCreateOrderResponse,
  setSubmitError,
  cartCount,
  displayTotal,
}: UseTelegramInvoiceProps) => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const invalidateOrderDomains = useInvalidateOrderDomains();
  // Covers the token-fetch/invoice/openInvoice steps, which happen before
  // createOrder is ever called, so the mutation's isPending alone doesn't
  // cover the whole submit.
  const [isTelegramSubmitting, setIsTelegramSubmitting] = useState(false);

  // An order created for a Telegram invoice that then wasn't paid is cancelled
  // again, so no unpaid order is left behind for the restaurant.
  const cancelUnpaidOrderMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId, shopid as string),
    // The local cart was already cleared for the consumed lines — refetch
    // it (and the order lists) so it matches the server again.
    onSettled: invalidateOrderDomains,
  });

  const submitViaTelegramInvoice = async (
    paymentType: TelegramInvoicePaymentType,
    payload: CreateOrderPayload,
    values: OrderFormValues,
  ) => {
    setIsTelegramSubmitting(true);

    try {
      const response = await createOrderSafely(payload);

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

  return { submitViaTelegramInvoice, isTelegramSubmitting };
};
