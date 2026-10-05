"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { loginUserClick } from "@/apis/auth";
import { useGeneral } from "@/hooks/useGeneral";
import { useAuthStore } from "@/stores/auth";
import { setCookie } from "@/utils/cookie";
import { setUser } from "@/utils/user";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

type ClickProviderProps = {
  clickToken: string | null;
};

export const ClickProvider = ({ clickToken }: ClickProviderProps) => {
  const locale = useLocale();
  const { data: general } = useGeneral();
  const setAuth = useAuthStore((state) => state.setAuth);
  const shopId = general?.data.id;

  const { data } = useQuery({
    enabled: Boolean(shopId) && Boolean(clickToken),
    queryKey: [REACT_QUERY_KEYS.CLICK_LOGIN, shopId, clickToken],
    queryFn: () => loginUserClick(clickToken as string, shopId as string),
  });

  useEffect(() => {
    if (!data?.data || !shopId) return;
    setUser(shopId, data.data);
    setAuth(data.data);
  }, [data?.data, shopId, setAuth]);

  useEffect(() => {
    setCookie("NEXT_LOCALE", locale);
  }, [locale]);

  return null;
};
