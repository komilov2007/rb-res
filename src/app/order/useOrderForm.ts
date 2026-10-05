"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useGeneral } from "@/hooks/useGeneral";
import {
  isProviderDelivery,
  isServiceDelivery,
} from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import { orderSchema } from "./schema";
import { getAvailableServices } from "./components/delivery-type/constants";
import { defaultValues } from "./constants";

export const useOrderForm = (
  services: NonNullable<ReturnType<typeof useGeneral>["data"]>["data"]["services"],
) => {
  const form = useForm<OrderFormValues>({
    mode: "onChange",
    resolver: yupResolver(orderSchema) as Resolver<OrderFormValues>,
    defaultValues,
  });

  const deliveryType = useWatch({ control: form.control, name: "delivery_type" });
  const branch = useWatch({ control: form.control, name: "branch" });
  const addressValue = useWatch({ control: form.control, name: "address" });
  const deliveryPrice = useWatch({
    control: form.control,
    name: "delivery_price",
  });
  const deliveryPriceType = useWatch({
    control: form.control,
    name: "delivery_price_type",
  });
  const spendCashback = useWatch({
    control: form.control,
    name: "spend_cashback",
  });
  const promoTotal = useWatch({ control: form.control, name: "total" });

  const availableServices = getAvailableServices(services);
  const selectedService = availableServices.find(
    (service) => service.type === deliveryType,
  );
  const isDelivery = isServiceDelivery(deliveryType);
  const isProvider = isProviderDelivery(deliveryType);

  return {
    form,
    deliveryType,
    addressValue,
    availableServices,
    selectedService,
    isDelivery,
    isProvider,
    totalsInput: {
      deliveryType,
      branch,
      deliveryPrice,
      deliveryPriceType,
      spendCashback,
      promoTotal,
    },
  };
};
