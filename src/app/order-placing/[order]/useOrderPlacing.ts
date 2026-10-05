"use client";

import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { useShopId } from "@/hooks/useShopId";
import { sendTelegramData } from "@/utils/telegram";

export const useOrderPlacing = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const orderDetail = useOrderDetail();

  const handleDone = async () => {
    const sent = await sendTelegramData({ id: Number(orderDetail.orderId) });

    if (!sent) {
      router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    }
  };

  return {
    ...orderDetail,
    handleDone,
  };
};
