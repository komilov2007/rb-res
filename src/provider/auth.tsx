"use client";

import { useEffect } from "react";

import { getUser } from "@/lib/user";
import { useShopid } from "@/hooks/useShopId";
import { useAuthStore } from "@/store/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { shopid } = useShopid();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (!shopid) return;

    setAuth(getUser(shopid)?.auth);
  }, [setAuth, shopid]);

  return children;
};
