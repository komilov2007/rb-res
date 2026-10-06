"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getOrderStatus } from "@/apis/order";
import { ROUTER } from "@/constants/router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getPlacedOrderUrl } from "@/utils/orders";
import { useShopId } from "@/hooks/useShopId";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { getCartTotal } from "@/utils/cart";
import { PRICED_DELIVERY_TYPES } from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import type { UnavailableState } from "./constants";
import type { CartItemProps } from "@/types/cart";

const POLL_INTERVAL_MS = 10000;
const UNTRACKED_WAIT_TIMEOUT_MS = 3 * 60 * 1000;

const isFinalStatus = (status?: string) =>
  status === "finished" || status === "canceled";

export const useOrderStatus = () => {
  const router = useRouter();
  const t = useTranslations();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const externalId = searchParams.get("externalId");
  const paymentUrl = searchParams.get("url");
  const paymentType = searchParams.get("paymentType");

  const canCheckStatus = Boolean(orderId && externalId);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [waitRound, setWaitRound] = useState(0);

  useEffect(() => {
    if (!orderId || externalId) return;

    const timer = setTimeout(
      () => setIsTimedOut(true),
      UNTRACKED_WAIT_TIMEOUT_MS,
    );

    return () => clearTimeout(timer);
  }, [orderId, externalId, waitRound]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: [REACT_QUERY_KEYS.ORDER_STATUS, orderId, externalId],
    queryFn: () => getOrderStatus(orderId as string, externalId as string),
    enabled: canCheckStatus,
    refetchInterval: (query) =>
      isFinalStatus(query.state.data?.data.status) ? false : POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
  const status = data?.data.status;

  useEffect(() => {
    if (status === "finished") {
      router.push(getPlacedOrderUrl(isDesktop, shopid, orderId));
      return;
    }

    if (status === "canceled") {
      toast.error(t("payment_canceled"));
      router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    }
  }, [status, orderId, router, shopid, t, isDesktop]);

  return {
    orderId,
    paymentUrl,
    paymentType,
    checkStatus: canCheckStatus ? () => void refetch() : undefined,
    isCheckingStatus: isFetching,
    isTimedOut,
    retryWaiting: () => {
      setIsTimedOut(false);
      setWaitRound((round) => round + 1);
    },
    orderUrl: orderId ? getPlacedOrderUrl(isDesktop, shopid, orderId) : null,
  };
};

type UseOrderTotalsProps = {
  carts: CartItemProps[];
  unavailable: UnavailableState | null;
  deliveryType: OrderFormValues["delivery_type"];
  branch: OrderFormValues["branch"];
  isDelivery: boolean;
  deliveryPrice: OrderFormValues["delivery_price"];
  deliveryPriceType: OrderFormValues["delivery_price_type"];
  spendCashback: OrderFormValues["spend_cashback"];
  promoTotal: OrderFormValues["total"];
  general: ReturnType<typeof useGeneral>["data"];
  profile: ReturnType<typeof useProfile>["data"];
};

export const useOrderTotals = ({
  carts,
  unavailable,
  deliveryType,
  branch,
  isDelivery,
  deliveryPrice,
  deliveryPriceType,
  spendCashback,
  promoTotal,
  general,
  profile,
}: UseOrderTotalsProps) => {
  const unavailableItemIds =
    unavailable &&
    unavailable.deliveryType === deliveryType &&
    unavailable.branch === branch
      ? unavailable.ids
      : [];

  const cartTotal = getCartTotal(carts);
  const orderDeliveryPrice =
    isDelivery &&
    typeof deliveryPrice === "number" &&
    PRICED_DELIVERY_TYPES.includes(deliveryPriceType ?? "")
      ? deliveryPrice
      : 0;
  const cashbackBall =
    general?.data?.cashback_enabled && spendCashback
      ? (profile?.data.cashback_ball ?? 0)
      : 0;
  const appliedPromoTotal = typeof promoTotal === "number" ? promoTotal : null;
  const oldPrice =
    appliedPromoTotal !== null ? cartTotal + orderDeliveryPrice : null;
  const displayTotal = Math.max(
    0,
    (appliedPromoTotal ?? cartTotal) +
      orderDeliveryPrice -
      cashbackBall,
  );

  return {
    unavailableItemIds,
    cartTotal,
    orderDeliveryPrice,
    cashbackBall,
    appliedPromoTotal,
    oldPrice,
    displayTotal,
  };
};
