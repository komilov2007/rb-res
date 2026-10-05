"use client";

import { useRouter } from "next/navigation";

import OrderDetailView from "@/components/order-detail-view";
import { useOrderDetail } from "@/hooks/useOrderDetail";

const MyOrderDetail = () => {
  const router = useRouter();
  const orderDetail = useOrderDetail();

  return <OrderDetailView {...orderDetail} onBack={() => router.back()} />;
};

export default MyOrderDetail;
