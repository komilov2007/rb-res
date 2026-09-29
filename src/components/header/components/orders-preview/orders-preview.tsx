"use client";

import { useRouter } from "next/navigation";

import { useShopId } from "@/hooks/useShopId";
import { getProfileOrdersUrl } from "@/utils/orders";

export const useGoToOrders = () => {
  const router = useRouter();
  const { shopid } = useShopId();

  return () => router.push(getProfileOrdersUrl(shopid));
};
