"use client";

import { useRouter } from "next/navigation";

import OrderDetailView from "@/components/order-detail-view";
import { useOrderDetail } from "@/hooks/useOrderDetail";

// Same view as order-placing's post-checkout detail (STEP 32); the only
// difference is that "back" here simply returns to wherever the user came
// from, and there's no post-checkout "Yopish"/Telegram close action.
const MyOrderDetail = () => {
  const router = useRouter();
  const orderDetail = useOrderDetail();

  return <OrderDetailView {...orderDetail} onBack={() => router.back()} />;
};

export default MyOrderDetail;
