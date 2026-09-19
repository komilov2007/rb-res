"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { cancelOrder, getOrderDetail, proceedToPayment } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { ROUTER } from "@/constants/router";
import { useShopid } from "@/hooks/useShopId";
import { sendTelegramData } from "@/lib/telegram";
import { getApiErrorMessage } from "@/utils/api-error";

// INFERRED, not independently confirmed against rb-restaurant's own
// backend behavior — matches the reference's polling cadence. A one-line
// change later if 30s feels wrong once tested live.
const POLL_INTERVAL_MS = 30000;

export const useOrderPlacing = () => {
  const t = useTranslations();
  const params = useParams<{ order: string }>();
  const orderId = params.order;
  const router = useRouter();
  const { shopid } = useShopid();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState<string | null>(null);

  const detailQuery = useQuery({
    enabled: Boolean(orderId),
    queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
    queryFn: () => getOrderDetail(orderId),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId, shopid as string),
    // Returning the detail refetch keeps isPending true until the cancelled
    // status has actually arrived (same as useMyOrderDetail.ts).
    onSuccess: () => {
      setCancelError(null);
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.MY_ORDERS],
      });
      return queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
      });
    },
    onError: (error) => {
      setCancelError(getApiErrorMessage(error, t("orders.cancel.failed")));
    },
  });

  const paymentMutation = useMutation({
    mutationFn: () => proceedToPayment(orderId),
    onSuccess: (response) => {
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    },
    // The global request interceptor already toasts the backend's message
    // (e.g. "Zakaz allaqachon to'langan"). That specific rejection means the
    // locally cached detail is stale (this route's detail query only
    // refetches every POLL_INTERVAL_MS) — refetch so the pay button reflects
    // the real status immediately instead of staying clickable until the
    // next poll.
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
      });
    },
  });

  // Explicit user action, per the bug-fix decision: finishOrder (usePage.ts)
  // now always navigates in-app to this page rather than trying to close
  // the Mini App itself — sendData only fires from here, when the user is
  // actually done looking at their order. sendTelegramData resolves `true`
  // whenever the Telegram WebApp SDK object exists at all (it's loaded
  // unconditionally on every page, even outside real Telegram — see
  // usePage.ts's finishOrder comment), so outside a real Telegram client
  // this falls back to a normal in-app navigation home instead of a no-op.
  const handleDone = async () => {
    const sent = await sendTelegramData({ id: Number(orderId) });

    if (!sent) {
      router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    }
  };

  return {
    orderId,
    detail: detailQuery.data?.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    cancelOrder: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    cancelError,
    proceedToPayment: paymentMutation.mutate,
    isPaying: paymentMutation.isPending,
    handleDone,
  };
};
