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
