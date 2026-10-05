"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOrderDetail, proceedToPayment } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { isClick } from "@/utils/click";
import { openPaymentLink } from "@/utils/telegram";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import { useAuthStore } from "@/stores/auth";

const POLL_INTERVAL_MS = 30000;

export const useOrderDetail = () => {
  const params = useParams<{ order: string }>();
  const orderId = params.order;
  const queryClient = useQueryClient();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  const detailQuery = useQuery({
    enabled: Boolean(orderId) && hasAccess,
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
      if (isClick()) {
        openPaymentLink(response.data.url);
        return;
      }

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
    isLoading: !isAuthReady || detailQuery.isLoading,
    mustLogin: isAuthReady && !hasAccess,
    isError: detailQuery.isError,
    cancelOrder,
    isCancelling,
    cancelError,
    proceedToPayment: paymentMutation.mutate,
    isPaying: paymentMutation.isPending,
  };
};

export type OrderDetailState = ReturnType<typeof useOrderDetail>;
