"use client";

import { useEffect } from "react";

import { getUser } from "@/utils/user";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { shopid } = useShopId();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // No shop_id → no stored session to read; keep the current auth and
    // just mark it as known.
    if (!shopid) {
      useAuthStore.setState({ isAuthReady: true });
      return;
    }

    setAuth(getUser(shopid)?.auth);
  }, [setAuth, shopid]);

  return children;
};

