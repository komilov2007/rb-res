"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { languages, type LanguageValue } from "@/constants/language";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { clearUser } from "@/utils/user";

export const useProfileAccount = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const locale = useLocale();
  const t = useTranslations();
  const { data, isLoading: isProfileLoading } = useProfile();
  const { data: general } = useGeneral();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasAccess = useAuthStore((state) => state.hasAccess) || isLeaving;
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const logout = useAuthStore((state) => state.logout);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const isLoading = !isAuthReady || (hasAccess && isProfileLoading);

  const languageLabel =
    languages[locale as LanguageValue]?.label ?? languages.uz.label;
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";
  const homeHref = `/${shopQuery}`;

  const profile = data?.data;
  const name = hasAccess
    ? profile?.firstname || t("profile_page_user_fallback")
    : t("login");
  const phone = hasAccess
    ? profile?.phone || "-"
    : t("profile_page_login_prompt");
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
  const businessPhone = general?.data.business_phone;
  const socials = general?.data.socials ?? [];

  const openLogin = () => setLoginModal(true, "/profile");

  const handleAccountAction = hasAccess
    ? () => {
        router.prefetch(homeHref);
        setLogoutOpen(true);
      }
    : openLogin;

  const handleLogout = () => {
    setIsLeaving(true);
    setLogoutOpen(false);
    clearUser(shopid);
    logout();
    router.push(homeHref);
  };

  return {
    router,
    shopQuery,
    isLoading,
    hasAccess,
    name,
    phone,
    initials,
    businessPhone,
    socials,
    languageLabel,
    languageOpen,
    setLanguageOpen,
    logoutOpen,
    setLogoutOpen,
    openLogin,
    handleAccountAction,
    handleLogout,
  };
};
