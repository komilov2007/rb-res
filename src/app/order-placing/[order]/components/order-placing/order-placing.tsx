"use client";

import { useRouter } from "next/navigation";

import OrderDetailView from "@/components/order-detail-view";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

import { useOrderPlacing } from "../../useOrderPlacing";

const OrderPlacing = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const orderDetail = useOrderPlacing();

  return (
    <OrderDetailView
      {...orderDetail}
      // Back always lands on the orders list — router.back() would return
      // to the already-submitted checkout page.
      onBack={() =>
        router.replace(
          `${ROUTER.MY_ORDERS}${shopid ? `?shop_id=${shopid}` : ""}`,
        )
      }
    />
  );
};

export default OrderPlacing;
