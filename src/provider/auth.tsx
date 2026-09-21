"use client";

import { useEffect } from "react";

import { getUser } from "@/utils/user";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { shopid } = useShopId();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (!shopid) return;

    setAuth(getUser(shopid)?.auth);
  }, [setAuth, shopid]);

  return children;
};

