"use client";

import { useParams, useSearchParams } from "next/navigation";

export const useShopid = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const shopid = searchParams.get("shop_id") ?? params.shopid;

  return {
    shopid: typeof shopid === "string" ? shopid : undefined,
    hasShopId: Boolean(shopid),
  };
};
