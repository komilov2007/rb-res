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
  // than only to the form, so this stays the single source of truth.
  // Already null whenever home isn't actually in PICKUP mode
  // (useBranchSelection's own logic).
  const { branchId: homeBranchId } = useBranchSelection();
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

  // Same query/key the address section runs — here only to block submit.
  const { isAllowed: isAddressDeliverable } = useAddressDeliverable(
    deliveryType,
    addresses.find((item) => item.id === addressValue) ?? null,
  );

  const nearestBranchQuery = useQuery({
    enabled:
      hasShopId && isDelivery && Boolean(latitude) && Boolean(longitude),
    queryKey: ["nearest-branch", shopid, latitude, longitude],
    queryFn: () =>
      getNearestBranch({
        shopid: shopid as string,
        latitude: latitude as number,
        longitude: longitude as number,
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
      (!isProvider || (Boolean(latitude) && Boolean(longitude))),
    // The address is part of the key, so changing it recalculates the
    // delivery price.
    queryKey: [
      "delivery-calculation",
      shopid,
      customerId,
      deliveryType,
      addressValue,
      latitude,
      longitude,
      cartTotal,
    ],
    queryFn: () =>
      getDeliveryCalculation(customerId as number, shopid as string, {
        total_amount: cartTotal,
        ...(isProvider
          ? {
              service_type: deliveryType as string,
              latitude: latitude ?? undefined,
              longitude: longitude ?? undefined,
            }
          : {}),
      }),
  });

  // Select the first offered service until the user picks one (or when the
  // selected one isn't offered by this shop).
  const firstServiceType = availableServices[0]?.type ?? null;
  const isSelectedServiceAvailable = Boolean(selectedService);

  useEffect(() => {
    if (isSelectedServiceAvailable || !firstServiceType) return;

    form.setValue("delivery_type", firstServiceType, { shouldValidate: true });
  }, [firstServiceType, isSelectedServiceAvailable, form]);

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

  // Autofill the delivery fields from the active saved address.
  useEffect(() => {
    if (!isDelivery) return;

    form.setValue("address", activeAddress?.id ?? null, {
      shouldValidate: true,
    });
    form.setValue("comment", activeAddress?.comment ?? null);
    form.setValue("floor", activeAddress?.floor ?? null);
    form.setValue("room", activeAddress?.room ?? null);
    form.setValue("entrance", activeAddress?.entrance ?? null);
  }, [
    isDelivery,
    activeAddress?.id,
    activeAddress?.comment,
    activeAddress?.floor,
    activeAddress?.room,
    activeAddress?.entrance,
    form,
  ]);

  // Keeps the form's branch equal to the shared selection. Picking a branch
  // in this page's own picker (src/app/order/components/branches) calls
  // setPickup, so homeBranchId changes and this effect re-applies the same
  // value — one direction of sync, no fight between the two. homeBranchId is
  // already null whenever home isn't actually in PICKUP mode
  // (useBranchSelection's own logic), so this only needs to gate on the
  // order's *own* delivery type being a pickup one.
  useEffect(() => {
    if (!isPickupType(deliveryType)) return;

    form.setValue("branch", homeBranchId, { shouldValidate: true });
  }, [deliveryType, homeBranchId, form]);

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
