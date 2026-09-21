"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOrderDetail, proceedToPayment } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useCancelOrder } from "@/hooks/useCancelOrder";

// INFERRED, not independently confirmed against rb-restaurant's own
// backend behavior — matches the reference's polling cadence. A one-line
// change later if 30s feels wrong once tested live.
const POLL_INTERVAL_MS = 30000;

// Detail query + cancel + retry-payment for one order, read from the route's
// [order] param. Shared by my-orders/[order] and order-placing/[order]: both
// routes render the same detail view, and sharing the exact same query key
// keeps either route's cache warm for the other.
export const useOrderDetail = () => {
  const params = useParams<{ order: string }>();
  const orderId = params.order;
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    enabled: Boolean(orderId),
    queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
    queryFn: () => getOrderDetail(orderId),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const { cancelOrder, isCancelling, cancelError } = useCancelOrder(orderId, {
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ORDER_DETAIL, orderId],
      }),
  });

  const paymentMutation = useMutation({
    mutationFn: () => proceedToPayment(orderId),
    onSuccess: (response) => {
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    },
    // The global request interceptor already toasts the backend's message
    // (e.g. "Zakaz allaqachon to'langan"). That specific rejection means the
    // locally cached detail is stale (the detail query only refetches every
    // POLL_INTERVAL_MS) — refetch so the pay button reflects the real status
    // immediately instead of staying clickable until the next poll.
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
    cancelOrder,
    isCancelling,
    cancelError,
    proceedToPayment: paymentMutation.mutate,
    isPaying: paymentMutation.isPending,
  };
};

export type OrderDetailState = ReturnType<typeof useOrderDetail>;
