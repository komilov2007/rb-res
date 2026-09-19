import * as yup from "yup";

import { isPickupType, isServiceDelivery } from "@/constants/delivery-type";
import type { DeliveryType } from "@/types/order";
import { translate } from "@/utils/translate";

const DELIVERY_TYPES: DeliveryType[] = [
  "DELIVERY",
  "PICKUP",
  "BTS_PICKUP",
  "YANDEX_DELIVERY",
  "NOOR_DELIVERY",
];

const isFilled = (value: string | null | undefined) => Boolean(value);

export const orderSchema = yup.object().shape(
  {
    delivery_type: yup
      .mixed<DeliveryType>()
      .oneOf(DELIVERY_TYPES)
      .nullable()
      .required(() => translate("order_page.errors.delivery_type_required")),

    payment_type: yup
      .string()
      .nullable()
      .required(() => translate("order_page.errors.payment_type_required")),
    branch: yup
      .number()
      .nullable()
      .default(null)
      .when("delivery_type", {
        is: isPickupType,
        then: (schema) =>
          schema
            .required(() => translate("order_page.errors.branch_required"))
            .nonNullable(() => translate("order_page.errors.branch_required")),
      }),
    address: yup
      .number()
      .nullable()
      .default(null)
      .when("delivery_type", {
        is: isServiceDelivery,
        then: (schema) =>
          schema
            .required(() => translate("select_address"))
            .nonNullable(() => translate("select_address")),
      }),

    room: yup.number().nullable().default(null),
    floor: yup.number().nullable().default(null),
    entrance: yup.number().nullable().default(null),
    comment: yup.string().nullable().default(null),
    spend_cashback: yup.boolean().required().default(false),
    promocode_id: yup.number().nullable().default(null),
    promocode: yup.string().nullable().default(null),
    total: yup.number().nullable().default(null),
    // Optional, but once one of them is filled the other is required too.
    shipping_date: yup
      .string()
      .nullable()
      .default(null)
      .when("shipping_time", {
        is: isFilled,
        then: (schema) =>
          schema
            .required(() => translate("order_page.errors.date_required"))
            .nonNullable(() => translate("order_page.errors.date_required")),
      }),
    shipping_time: yup
      .string()
      .nullable()
      .default(null)
      .when("shipping_date", {
        is: isFilled,
        then: (schema) =>
          schema
            .required(() => translate("order_page.errors.time_required"))
            .nonNullable(() => translate("order_page.errors.time_required")),
      }),
    delivery_price: yup.number().nullable().default(null),
    delivery_price_type: yup.string().nullable().default(null),
  },
  [["shipping_date", "shipping_time"]],
);
