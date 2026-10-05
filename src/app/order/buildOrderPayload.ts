import type { CreateOrderPayload } from "@/apis/order";
import type { CartItemProps } from "@/types/cart";
import type { OrderFormValues } from "@/types/order";

import { getActiveCartLines } from "@/utils/cart";

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
    branch: isDeliveryOrder ? null : values.branch,
    payment_type: values.payment_type as string,
    service_type: values.delivery_type as string,
    is_paid: false,
    promo_code: values.promocode_id ?? undefined,
    items: orderItems,
    shipping_datetime: hasShippingTime
      ? buildShippingDatetime(values.shipping_date, values.shipping_time)
      : null,
    is_menu_button: false,
  };

  if (isDeliveryOrder && values.address !== null) {
    payload.address = {
      address: values.address,
      room: values.room,
      floor: values.floor,
      entrance: values.entrance,
      comment: values.comment?.trim() || null,
    };
  }

  return payload;
};

export const getOrderItems = (carts: CartItemProps[]) =>
  getActiveCartLines(carts).flatMap((item) =>
    typeof item.id === "number" ? [item.id] : [],
  );
