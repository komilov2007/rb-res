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
// Without an externalId the status can't be polled at all; after this long
// the waiting screen gives up instead of waiting forever.
const UNTRACKED_WAIT_TIMEOUT_MS = 3 * 60 * 1000;

const isFinalStatus = (status?: string) =>
  status === "finished" || status === "canceled";

// Payment-callback state (?orderId=&externalId=) — same shape as rb-shop's
// hoc-payment: TanStack Query polls the status every 10s until the payment
// resolves, then the page leaves the waiting screen.
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
  // Bumped by retry() to start a fresh timeout window.
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
    // Keeps polling while the user completes payment in the external
    // provider (the Mini App is in the background meanwhile).
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
    // The waiting screen's "check" button: an immediate poll instead of
    // waiting for the next interval. Without an externalId there is nothing
    // to check (the query is disabled), so it stays unavailable.
    checkStatus: canCheckStatus ? () => void refetch() : undefined,
    isCheckingStatus: isFetching,
    // Untracked payment (no externalId) that never resolved in time.
    isTimedOut,
    retryWaiting: () => {
      setIsTimedOut(false);
      setWaitRound((round) => round + 1);
    },
    // Where the order (and its real payment status) can be seen.
    orderUrl: orderId ? getPlacedOrderUrl(isDesktop, shopid, orderId) : null,
  };
};
