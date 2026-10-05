"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cart";
import { useShopId } from "@/hooks/useShopId";
import { type CreateOrderResponse } from "@/apis/order";
import { ROUTER } from "@/constants/router";
import type { OrderFormValues } from "@/types/order";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getPlacedOrderUrl } from "@/utils/orders";
import { openPaymentLink } from "@/utils/telegram";
import {
  ONLINE_PAYMENT_TYPES,
  ONLINE_PAYMENT_TYPE_NAMES,
  isValidPaymentUrl,
  type UnavailableState,
} from "./constants";

type UseOrderResponseProps = {
  unavailableItemIds: number[];
  setUnavailable: (state: UnavailableState) => void;
  openUnavailableModal: () => void;
};

export const useOrderResponse = ({
  unavailableItemIds,
  setUnavailable,
  openUnavailableModal,
}: UseOrderResponseProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { shopid } = useShopId();
  const clearCart = useCartStore((state) => state.clearCart);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const finishOrder = (order: number) => {
    router.push(getPlacedOrderUrl(isDesktop, shopid, order));
  };

  const goHome = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const handleCreateOrderResponse = (
    data: CreateOrderResponse,
    values: OrderFormValues,
  ) => {
    if (data.unavailable_products && data.unavailable_products.length > 0) {
      setUnavailable({
        ids: [...unavailableItemIds, ...data.unavailable_products],
        deliveryType: values.delivery_type,
        branch: values.branch,
      });
      openUnavailableModal();
      return;
    }

    clearCart();

    const paymentType = values.payment_type;

    if (paymentType && ONLINE_PAYMENT_TYPES.includes(paymentType)) {
      if (!data.url || !isValidPaymentUrl(data.url.url)) {
        const name = ONLINE_PAYMENT_TYPE_NAMES[paymentType] ?? paymentType;

        toast.error(t("order_page_errors_provider_disabled", { name }));
        goHome();
        return;
      }

      const query = new URLSearchParams({
        orderId: String(data.url.order_id),
        url: data.url.url,
        paymentType,
      });

      if (data.url.external_id) {
        query.set("externalId", data.url.external_id);
      }

      if (shopid) {
        query.set("shop_id", shopid);
      }

      router.push(`${ROUTER.ORDER}?${query.toString()}`);
      openPaymentLink(data.url.url);
      return;
    }

    finishOrder(data.order);
  };

  return { handleCreateOrderResponse };
};
