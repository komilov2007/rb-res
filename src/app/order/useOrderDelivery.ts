"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useLocationStore } from "@/stores/location";
import { useAuthStore } from "@/stores/auth";
import { useShopId } from "@/hooks/useShopId";
import { getNearestBranch } from "@/apis/branches";
import { getDeliveryCalculation } from "@/apis/order";
import { isPickupType } from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import { useAddresses } from "@/hooks/useAddresses";
import { useAddressDeliverable } from "./useAddressDeliverable";
import { getAvailableServices } from "./components/delivery-type/constants";
import { toDeliveryPrice } from "./constants";
import type { UseFormReturn } from "react-hook-form";
import { useBranchSelection } from "@/components/branch-selection";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

type UseOrderDeliveryProps = {
  form: UseFormReturn<OrderFormValues>;
  deliveryType: OrderFormValues["delivery_type"];
  addressValue: OrderFormValues["address"];
  isDelivery: boolean;
  isProvider: boolean;
  cartTotal: number;
  availableServices: ReturnType<typeof getAvailableServices>;
  selectedService: ReturnType<typeof getAvailableServices>[number] | undefined;
};

export const useOrderDelivery = ({
  form,
  deliveryType,
  addressValue,
  isDelivery,
  isProvider,
  cartTotal,
  availableServices,
  selectedService,
}: UseOrderDeliveryProps) => {
  const { branchId: homeBranchId, serviceType: homeServiceType } =
    useBranchSelection();
  const { shopid, hasShopId } = useShopId();
  const addressId = useLocationStore((state) => state.addressId);
  const storeAddress = useLocationStore((state) => state.address);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const customerId = useAuthStore((state) => state.auth?.customer);

  const addressesQuery = useAddresses(customerId);

  const addresses = addressesQuery.data?.data ?? [];
  const activeAddress =
    addresses.find((item) => item.id === addressId) ??
    addresses.find((item) => item.address === storeAddress) ??
    addresses.find((item) => item.is_current) ??
    addresses[0] ??
    null;

  const deliveryLatitude = activeAddress?.latitude ?? latitude;
  const deliveryLongitude = activeAddress?.longitude ?? longitude;

  const { isAllowed: isAddressDeliverable } = useAddressDeliverable(
    deliveryType,
    addresses.find((item) => item.id === addressValue) ?? null,
  );

  const nearestBranchQuery = useQuery({
    enabled:
      hasShopId &&
      isDelivery &&
      Boolean(deliveryLatitude) &&
      Boolean(deliveryLongitude),
    queryKey: [
      REACT_QUERY_KEYS.NEAREST_BRANCH,
      shopid,
      deliveryLatitude,
      deliveryLongitude,
    ],
    queryFn: () =>
      getNearestBranch({
        shopid: shopid as string,
        latitude: deliveryLatitude as number,
        longitude: deliveryLongitude as number,
      }),
  });

  const deliveryCalculationQuery = useQuery({
    enabled:
      hasShopId &&
      Boolean(customerId) &&
      isDelivery &&
      cartTotal > 0 &&
      addressValue !== null &&
      (!isProvider || (Boolean(deliveryLatitude) && Boolean(deliveryLongitude))),
    queryKey: [
      REACT_QUERY_KEYS.DELIVERY_CALCULATION,
      shopid,
      customerId,
      deliveryType,
      addressValue,
      deliveryLatitude,
      deliveryLongitude,
      cartTotal,
    ],
    queryFn: () =>
      getDeliveryCalculation(customerId as number, shopid as string, {
        total_amount: cartTotal,
        ...(isProvider
          ? {
              service_type: deliveryType as string,
              latitude: deliveryLatitude ?? undefined,
              longitude: deliveryLongitude ?? undefined,
            }
          : {}),
      }),
  });

  const defaultServiceType =
    availableServices.find((service) => service.type === homeServiceType)
      ?.type ??
    availableServices[0]?.type ??
    null;
  const isSelectedServiceAvailable = Boolean(selectedService);

  useEffect(() => {
    if (isSelectedServiceAvailable || !defaultServiceType) return;

    form.setValue("delivery_type", defaultServiceType, {
      shouldValidate: true,
    });
  }, [defaultServiceType, isSelectedServiceAvailable, form]);

  useEffect(() => {
    form.setValue("payment_type", null);
    form.setValue("delivery_price", null);
    form.setValue("delivery_price_type", null);
    form.setValue("shipping_date", null);
    form.setValue("shipping_time", null);
    form.clearErrors(["shipping_date", "shipping_time"]);
  }, [deliveryType, form]);

  const activeEntrance = activeAddress?.entrance ?? null;
  const activeFloor = activeAddress?.floor ?? null;
  const activeRoom = activeAddress?.room ?? null;
  const activeComment = activeAddress?.comment || null;

  useEffect(() => {
    if (!isDelivery) return;

    form.setValue("address", activeAddress?.id ?? null, {
      shouldValidate: true,
    });
    form.setValue("comment", activeComment);
    form.setValue("floor", activeFloor);
    form.setValue("room", activeRoom);
    form.setValue("entrance", activeEntrance);
  }, [
    isDelivery,
    activeAddress?.id,
    activeEntrance,
    activeFloor,
    activeRoom,
    activeComment,
    form,
  ]);

  const homePickupBranchId =
    homeServiceType === "PICKUP" ? homeBranchId : null;

  useEffect(() => {
    if (!isPickupType(deliveryType)) return;

    form.setValue("branch", homePickupBranchId, { shouldValidate: true });
  }, [deliveryType, homePickupBranchId, form]);

  useEffect(() => {
    const data = deliveryCalculationQuery.data?.data;

    if (!data) return;

    form.setValue("delivery_price", toDeliveryPrice(data.delivery));
    form.setValue("delivery_price_type", data.delivery_type);
  }, [deliveryCalculationQuery.data, deliveryType, form]);

  return { isAddressDeliverable, nearestBranchQuery };
};
