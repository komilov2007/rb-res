"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cart";
import { useShopId } from "@/hooks/useShopId";
import { type CreateOrderResponse } from "@/apis/order";
import { ROUTER } from "@/constants/router";
import type { OrderFormValues } from "@/types/order";
import { openPaymentLink } from "@/utils/telegram";
import {
  ONLINE_PAYMENT_TYPES,
  ONLINE_PAYMENT_TYPE_NAMES,
  isValidPaymentUrl,
  UnavailableState,
} from "./constants";

type UseOrderResponseProps = {
  unavailableItemIds: number[];
  setUnavailable: (state: UnavailableState) => void;
  openUnavailableModal: () => void;
};

// What happens after createOrder answers: unavailable lines reopen the
// page with them excluded, online payments hand off to the provider, and
// everything else lands on the order-placing page.
export const useOrderResponse = ({
  unavailableItemIds,
  setUnavailable,
  openUnavailableModal,
}: UseOrderResponseProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { shopid } = useShopId();
  const clearCart = useCartStore((state) => state.clearCart);

  // Group A (direct payment types) and Group B (after a paid Telegram
  // invoice) both land here once the order is actually created. Always
  // navigates in-app to the real order-placing/invoice page (STEP 28); only
  // an explicit "Done" action from that page closes the Mini App.
  const finishOrder = (order: number) => {
    router.push(
      `${ROUTER.ORDER_PLACING}/${order}${shopid ? `?shop_id=${shopid}` : ""}`,
    );
  };

  const goHome = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const handleCreateOrderResponse = (
    data: CreateOrderResponse,
    values: OrderFormValues,
  ) => {
    if (data.unavailable_products && data.unavailable_products.length > 0) {
      // The order doesn't proceed: the user either changes the branch or
      // goes back to the cart; a resubmit excludes these items.
      setUnavailable({
        ids: [...unavailableItemIds, ...data.unavailable_products],
        deliveryType: values.delivery_type,
        branch: values.branch,
      });
      openUnavailableModal();
      return;
    }

    // The backend consumes the cart the moment createOrder succeeds,
    // regardless of payment type — clearing the local store keeps the home
    // page's cart badge correct immediately.
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

      // Without this, the /order page useOrderStatus lands on next loses
      // shop_id the instant this redirect happens (useShopId() re-reads
      // useSearchParams() fresh every render) — which then also makes its
      // own later router.push to ORDER_PLACING carry an empty shopid.
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
