"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart";
import { useShopId } from "@/hooks/useShopId";
import { type CreateOrderResponse } from "@/apis/order";
import { ROUTER } from "@/constants/router";
import type { OrderFormValues } from "@/types/order";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getPlacedOrderUrl } from "@/utils/orders";
import { openPaymentLink } from "@/utils/telegram";
import { ONLINE_PAYMENT_TYPES, ONLINE_PAYMENT_TYPE_NAMES, isValidPaymentUrl, type UnavailableState, defaultValues } from "./constants";
import { useQueryClient } from "@tanstack/react-query";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGeneral } from "@/hooks/useGeneral";
import { isProviderDelivery, isServiceDelivery } from "@/constants/delivery-type";
import { orderSchema } from "./schema";
import { getAvailableServices } from "@/app/order/components/delivery-type/delivery-type";

type UseOrderResponseProps = {
  unavailableItemIds: number[];
  setUnavailable: (state: UnavailableState) => void;
  openUnavailableModal: () => void;
};

export const useOrderResponse = ({
  unavailableItemIds,
  setUnavailable,
  openUnavailableModal,
}: UseOrderResponseProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { shopid } = useShopId();
  const clearCart = useCartStore((state) => state.clearCart);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const finishOrder = (order: number) => {
    router.push(getPlacedOrderUrl(isDesktop, shopid, order));
  };

  const goHome = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const handleCreateOrderResponse = (
    data: CreateOrderResponse,
    values: OrderFormValues,
  ) => {
    if (data.unavailable_products && data.unavailable_products.length > 0) {
      setUnavailable({
        ids: [...unavailableItemIds, ...data.unavailable_products],
        deliveryType: values.delivery_type,
        branch: values.branch,
      });
      openUnavailableModal();
      return;
    }

    clearCart();

    const paymentType = values.payment_type;

    if (paymentType && ONLINE_PAYMENT_TYPES.includes(paymentType)) {
      if (!data.url || !isValidPaymentUrl(data.url.url)) {
        const name = ONLINE_PAYMENT_TYPE_NAMES[paymentType] ?? paymentType;

        toast.error(t("order_page_errors_provider_disabled", { name }));
        goHome();
        return;
      }

      const query = new URLSearchParams({
        orderId: String(data.url.order_id),
        url: data.url.url,
        paymentType,
      });

      if (data.url.external_id) {
        query.set("externalId", data.url.external_id);
      }

      if (shopid) {
        query.set("shop_id", shopid);
      }

      router.push(`${ROUTER.ORDER}?${query.toString()}`);
      openPaymentLink(data.url.url);
      return;
    }

    finishOrder(data.order);
  };

  return { handleCreateOrderResponse };
};

export const useInvalidateOrderDomains = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.CART_LIST] });
    queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.MY_ORDERS] });
    queryClient.invalidateQueries({
      queryKey: [REACT_QUERY_KEYS.ACTIVE_ORDERS_COUNT],
    });
    queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.PROFILE] });
  };
};

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
