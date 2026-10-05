"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cancelOrder } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";
import { getApiErrorMessage } from "@/utils/api-error";

type UseCancelOrderOptions = {
  onSuccess?: () => unknown;
};

export const useCancelOrder = (
  orderId: number | string,
  { onSuccess }: UseCancelOrderOptions = {},
) => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => cancelOrder(orderId, shopid as string),
    onSuccess: () => {
      setCancelError(null);
      toast.success(t("orders_cancel_success"));
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.MY_ORDERS],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ACTIVE_ORDERS_COUNT],
      });
      return onSuccess?.();
    },
    onError: (error) => {
      setCancelError(getApiErrorMessage(error, t("orders_cancel_failed")));
    },
  });

  return {
    cancelOrder: mutation.mutate,
    isCancelling: mutation.isPending,
    cancelError,
  };
};
