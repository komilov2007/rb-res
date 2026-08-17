"use client";

import { useSearchParams } from "next/navigation";

export const useShopid = () => {
  const searchParams = useSearchParams();
  const shopid = searchParams.get("shop_id") ?? undefined;

  return {
    shopid,
    hasShopId: Boolean(shopid),
  };
};
