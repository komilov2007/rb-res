import { useQuery } from "@tanstack/react-query";

import { checkDeliveryAddress, type AddressProps } from "@/apis/address";
import { useShopId } from "@/hooks/useShopId";
import type { DeliveryType } from "@/types/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

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
