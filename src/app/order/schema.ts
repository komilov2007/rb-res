import * as yup from "yup";
import { isPickupType, isServiceDelivery } from "@/constants/delivery-type";
import type { DeliveryType } from "@/types/order";
import { translate } from "@/utils/translate";
import { useQuery } from "@tanstack/react-query";
import { checkDeliveryAddress } from "@/apis/address";
import { type AddressProps } from "@/types/address";
import { useShopId } from "@/hooks/useShopId";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

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
      .required(() => translate("order_page_errors_delivery_type_required")),

    payment_type: yup
      .string()
      .nullable()
      .required(() => translate("order_page_errors_payment_type_required")),
    branch: yup
      .number()
      .nullable()
      .default(null)
      .when("delivery_type", {
        is: isPickupType,
        then: (schema) =>
          schema
            .required(() => translate("order_page_errors_branch_required"))
            .nonNullable(() => translate("order_page_errors_branch_required")),
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
    shipping_date: yup
      .string()
      .nullable()
      .default(null)
      .when("shipping_time", {
        is: isFilled,
        then: (schema) =>
          schema
            .required(() => translate("order_page_errors_date_required"))
            .nonNullable(() => translate("order_page_errors_date_required")),
      }),
    shipping_time: yup
      .string()
      .nullable()
      .default(null)
      .when("shipping_date", {
        is: isFilled,
        then: (schema) =>
          schema
            .required(() => translate("order_page_errors_time_required"))
            .nonNullable(() => translate("order_page_errors_time_required")),
      }),
    delivery_price: yup.number().nullable().default(null),
    delivery_price_type: yup.string().nullable().default(null),
  },
  [["shipping_date", "shipping_time"]],
);

export const ADDRESS_NOT_DELIVERABLE_MESSAGE = "order_page_address_not_deliverable";

export const useAddressDeliverable = (
  deliveryType: DeliveryType | null | undefined,
  address: AddressProps | null,
) => {
  const { shopid } = useShopId();
  const latitude = address?.latitude;
  const longitude = address?.longitude;

  const query = useQuery({
    enabled:
      deliveryType === "DELIVERY" &&
      Boolean(shopid) &&
      typeof latitude === "number" &&
      typeof longitude === "number",
    queryKey: [REACT_QUERY_KEYS.CHECK_DELIVERY, shopid, latitude, longitude],
    queryFn: () =>
      checkDeliveryAddress(shopid as string, {
        lat: latitude as number,
        long: longitude as number,
      }),
  });

  return {
    isAllowed:
      deliveryType !== "DELIVERY" || (query.data?.data.is_allow ?? true),
    isChecking: query.isFetching,
  };
};
