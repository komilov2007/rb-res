import { useQuery } from "@tanstack/react-query";

import { checkDeliveryAddress, type AddressProps } from "@/apis/address";
import { useShopid } from "@/hooks/useShopId";
import type { DeliveryType } from "@/types/order";

// Translation key — rendered via t() in the address section.
export const ADDRESS_NOT_DELIVERABLE_MESSAGE = "order_page_address_not_deliverable";

// Same check as rb-shop's order/components/address-deliverable — the backend
// decides whether the selected address lies in one of the shop's delivery
// cities. Shared by the address section (shows the message) and usePage
// (blocks submit) under one query key, so it's a single request.
// Only the shop's own DELIVERY service is checked: the endpoint takes no
// service type, and provider couriers (Yandex/Noor) have their own coverage.
// Unknown/failed checks count as allowed — the backend still validates the
// order itself.
export const useAddressDeliverable = (
  deliveryType: DeliveryType | null | undefined,
  address: AddressProps | null,
) => {
  const { shopid } = useShopid();
  const latitude = address?.latitude;
  const longitude = address?.longitude;

  const query = useQuery({
    enabled:
      deliveryType === "DELIVERY" &&
      Boolean(shopid) &&
      typeof latitude === "number" &&
      typeof longitude === "number",
    queryKey: ["check-delivery", shopid, latitude, longitude],
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
