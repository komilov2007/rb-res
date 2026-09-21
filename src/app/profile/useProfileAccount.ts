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

// Account summary + logout/login/language state shared by the mobile profile
// page (profile.tsx) and the desktop ProfileSidebar. Each caller gets its
// own instance (own dialogs, own isLeaving), exactly as when this lived
// inline in both.
export const useProfileAccount = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const locale = useLocale();
  const t = useTranslations();
  const { data, isLoading } = useProfile();
  const { data: general } = useGeneral();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  // After confirming logout the page keeps its logged-in look until the home
  // page replaces it — otherwise the guest view flashes during navigation.
  const hasAccess = useAuthStore((state) => state.hasAccess) || isLeaving;
  const logout = useAuthStore((state) => state.logout);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

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

  // The logout/login card's action.
  const handleAccountAction = hasAccess
    ? () => {
        // Warm up home so leaving after "Chiqish" is quick.
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
    shopid,
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
