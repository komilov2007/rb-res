import type { CreateOrderPayload } from "@/apis/order";
import type { CartItemProps } from "@/types/cart";
import type { OrderFormValues } from "@/types/order";

import { buildShippingDatetime } from "./constants";

type BuildOrderPayloadParams = {
  values: OrderFormValues;
  isDeliveryOrder: boolean;
  nearBranch: number | null;
  shopid: string;
  customerId: number;
  orderItems: number[];
  hasShippingTime: boolean;
};

// The createOrder request body — the same fields, in the same order, the
// submit handler has always sent.
export const buildOrderPayload = ({
  values,
  isDeliveryOrder,
  nearBranch,
  shopid,
  customerId,
  orderItems,
  hasShippingTime,
}: BuildOrderPayloadParams) => {
  const payload: CreateOrderPayload = {
    spend_cashback: values.spend_cashback,
    near_branch: nearBranch,
    shop: shopid,
    customer: Number(customerId),
    platform: "TELEGRAM",
    branch: values.branch,
    payment_type: values.payment_type as string,
    service_type: values.delivery_type as string,
    is_paid: false,
    promo_code: values.promocode_id ?? undefined,
    items: orderItems,
    // Only services with shipping_time accept a scheduled time.
    shipping_datetime: hasShippingTime
      ? buildShippingDatetime(values.shipping_date, values.shipping_time)
      : null,
    // No source for this flag exists in rb-restaurant yet — nothing records
    // whether the Mini App was opened from the Telegram menu button.
    is_menu_button: false,
  };

  if (isDeliveryOrder && values.address !== null) {
    payload.address = {
      address: values.address,
      room: values.room,
      floor: values.floor,
      entrance: values.entrance,
      comment: values.comment,
    };
  }

  return payload;
};

// Only active cart lines, minus the ones reported unavailable.
export const getOrderItems = (
  carts: CartItemProps[],
  unavailableItemIds: number[],
) =>
  carts.flatMap((item) =>
    item.is_active &&
    typeof item.id === "number" &&
    !unavailableItemIds.includes(item.id)
      ? [item.id]
      : [],
  );
