"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getOrderStatus } from "@/apis/order";
import { ROUTER } from "@/constants/router";
import { useShopid } from "@/hooks/useShopId";

const POLL_INTERVAL_MS = 10000;

export const useOrderStatus = () => {
  const router = useRouter();
  const t = useTranslations();
  const { shopid } = useShopid();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const externalId = searchParams.get("externalId");
  const paymentUrl = searchParams.get("url");
  const paymentType = searchParams.get("paymentType");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keeps the waiting screen in sync while the user completes payment in the
  // external provider.
  const checkStatus = useCallback(async () => {
    if (!orderId || !externalId) return;
    const response = await getOrderStatus(orderId, externalId);
    if (response.data.status === "finished") {
      router.push(
        `${ROUTER.ORDER_PLACING}/${orderId}${shopid ? `?shop_id=${shopid}` : ""}`,
      );
      return "finished" as const;
    }

    if (response.data.status === "canceled") {
      toast.error(t("payment_canceled"));
      router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
      return "canceled" as const;
    }

    return "pending" as const;
  }, [orderId, externalId, router, shopid, t]);

  useEffect(() => {
    if (!orderId || !externalId) return;

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const run = async () => {
      const status = await checkStatus();

      if (status !== "pending") stop();
    };

    void run();
    intervalRef.current = setInterval(() => void run(), POLL_INTERVAL_MS);

    return stop;
  }, [orderId, externalId, checkStatus]);

  return {
    isPolling: Boolean(orderId && externalId),
    orderId,
    paymentUrl,
    paymentType,
    checkStatus,
  };
};
