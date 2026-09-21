"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { cancelOrder, getOrderDetail, proceedToPayment } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopid } from "@/hooks/useShopId";
import { getApiErrorMessage } from "@/utils/api-error";

// Same query key/queryFn/refetchInterval as order-placing's useOrderPlacing.ts
// (STEP 32.1) — this route is read-only aside from the cancel action (STEP
// 32.3), so only the detail query + cancel mutation are reused here, not
// useOrderPlacing's retry-payment/handleDone active-checkout side effects.
// Sharing the exact same query key also means either route's cache is warm
// for the other.
const POLL_INTERVAL_MS = 30000;

export const useMyOrderDetail = () => {
  const t = useTranslations();
  const params = useParams<{ order: string }>();
  const orderId = params.order;
  const { shopid } = useShopid();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState<string | null>(null);

  const detailQuery = useQuery({
    enabled: Boolean(orderId),
    queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
    queryFn: () => getOrderDetail(orderId),
    refetchInterval: POLL_INTERVAL_MS,
  });

  // Same mutationFn/invalidation strategy as useOrderPlacing.ts's
  // cancelMutation — kept as a separate instance since this hook backs a
  // different route, but not rebuilt: same API call, same query keys
  // invalidated, same error message.
  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId, shopid as string),
    // Returning the detail refetch keeps isPending true until the cancelled
    // status has actually arrived — otherwise the cancel button flips back
    // to enabled for a moment between the API response and the refetch.
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
      setCancelError(getApiErrorMessage(error, t("orders_cancel_failed")));
    },
  });

  // Same mutationFn/onSuccess/onError as useOrderPlacing.ts's paymentMutation
  // — this route now offers the same "pay for an unpaid order" action.
  const paymentMutation = useMutation({
    mutationFn: () => proceedToPayment(orderId),
    onSuccess: (response) => {
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
      });
    },
  });

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
  };
};
