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

// Keeps the order form in sync with where the order goes: the saved
// address (autofilled), the nearest branch and delivery price for
// deliveries, the shared pickup branch, and the default service type.
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
  // The shared pickup branch (home selector, header chip, product
  // availability) mirrored into the form — see the sync effect below. The
  // order page's own branch picker writes back to that same store rather
  // than only to the form, so this stays the single source of truth. In
  // DELIVERY mode branchId is the nearest branch instead (useBranchSelection),
  // hence the PICKUP gate on homePickupBranchId below.
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

  // The point the order is actually delivered to: the address the form
  // sends. The stored coordinates are only a fallback — they can belong to
  // an address that no longer exists (deleted on another device), which
  // would price and route the order for the wrong place.
  const deliveryLatitude = activeAddress?.latitude ?? latitude;
  const deliveryLongitude = activeAddress?.longitude ?? longitude;

  // Same query/key the address section runs — here only to block submit.
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
      // Without a selected address the backend answers "Customer does not
      // have a current address set." — the address section already asks
      // for one, so no request (and no error toast) until it's picked.
      addressValue !== null &&
      (!isProvider || (Boolean(deliveryLatitude) && Boolean(deliveryLongitude))),
    // The address is part of the key, so changing it recalculates the
    // delivery price.
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

  // Until the user picks one (or when the selected one isn't offered by
  // this shop): the service saved in the home address/branch choice
  // ("Olib ketish" → PICKUP), else the first offered service.
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

  // Payment methods, the delivery price and the shipping time all depend on
  // the selected service type, so they're cleared whenever it changes. No
  // `shouldValidate` on payment_type: the payment section hasn't necessarily
  // loaded yet, so flagging it invalid immediately would show an error
  // before the user has even seen the options — it still validates on submit.
  useEffect(() => {
    form.setValue("payment_type", null);
    form.setValue("delivery_price", null);
    form.setValue("delivery_price_type", null);
    form.setValue("shipping_date", null);
    form.setValue("shipping_time", null);
    form.clearErrors(["shipping_date", "shipping_time"]);
  }, [deliveryType, form]);

  // The address id and its details all come from the active saved address:
  // entrance/floor/room and the courier comment are asked once, when the
  // address is added in the location modal, so the order sends those saved
  // values instead of asking for them again. Re-applied when the address
  // changes or its saved details are edited.
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

  // Keeps the form's branch equal to the shared selection. Picking a branch
  // in this page's own picker (src/app/order/components/branches) calls
  // setPickup, so homeBranchId changes and this effect re-applies the same
  // value — one direction of sync, no fight between the two. Only a branch
  // home actually picked for PICKUP counts: in DELIVERY mode home's branchId
  // is the delivery's nearest branch, which the user never chose.
  const homePickupBranchId =
    homeServiceType === "PICKUP" ? homeBranchId : null;

  useEffect(() => {
    if (!isPickupType(deliveryType)) return;

    form.setValue("branch", homePickupBranchId, { shouldValidate: true });
  }, [deliveryType, homePickupBranchId, form]);

  // deliveryType is a dependency so a cached calculation is re-applied after
  // the reset effect above clears it on a service type change.
  useEffect(() => {
    const data = deliveryCalculationQuery.data?.data;

    if (!data) return;

    form.setValue("delivery_price", toDeliveryPrice(data.delivery));
    form.setValue("delivery_price_type", data.delivery_type);
  }, [deliveryCalculationQuery.data, deliveryType, form]);

  return { isAddressDeliverable, nearestBranchQuery };
};
