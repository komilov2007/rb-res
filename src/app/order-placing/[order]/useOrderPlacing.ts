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

  // Explicit user action, per the bug-fix decision: finishOrder (usePage.ts)
  // now always navigates in-app to this page rather than trying to close
  // the Mini App itself — sendData only fires from here, when the user is
  // actually done looking at their order. sendTelegramData resolves `true`
  // whenever the Telegram WebApp SDK object exists at all (it's loaded
  // unconditionally on every page, even outside real Telegram — see
  // usePage.ts's finishOrder comment), so outside a real Telegram client
  // this falls back to a normal in-app navigation home instead of a no-op.
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
