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
import { Globe2, LogIn, LogOut, Package } from "lucide-react";
import { IconBellFilled, IconHelpCircleFilled, IconMapPinFilled, IconMessageCircleFilled, IconPencilFilled, IconPhoneFilled } from "@tabler/icons-react";
import PageLayout from "@/components/page-layout";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useOpenChat } from "@/hooks/useOpenChat";
import { useIsClick } from "@/hooks/useIsClick";
import AccountCard from "@/app/profile/components/account-card/index";
import EditProfileForm from "@/app/profile/components/edit-profile-form/index";
import { LanguageSheet } from "@/app/profile/components/logout-dialog";
import LogoutDialog from "@/app/profile/components/logout-dialog/index";
import { PoweredBy } from "@/app/profile/components/profile-desktop-layout";
import { ProfileGroup, ProfileItem } from "@/app/profile/components/profile-desktop-layout";
import ProfileDesktopLayout from "@/app/profile/components/profile-desktop-layout/index";
import { SocialLinks } from "@/app/profile/components/profile-page-shell";

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

const Profile = () => {
  const t = useTranslations();
  const openChat = useOpenChat();
  const isClickApp = useIsClick();
  const {
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
  } = useProfileAccount();

  const accountCard = (
    <AccountCard
      variant="mobile"
      isLoading={isLoading}
      hasAccess={hasAccess}
      initials={initials}
      name={name}
      phone={phone}
      onEdit={() => router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)}
      onLogin={openLogin}
    />
  );

  const contactCard = (
    <div className="mt-2 rounded-2xl border border-gray180 bg-white px-2 py-3">
      {businessPhone && (
        <a
          href={`tel:${businessPhone}`}
          className="flex min-h-10 items-center gap-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray10 text-gray220">
            <IconPhoneFilled size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="info-label">
              {t("profile_page_contact_label")}
            </p>
            <p className="info-value truncate">
              {businessPhone}
            </p>
          </div>
        </a>
      )}

      {socials.length > 0 && (
        <div className="mt-3 border-t border-gray180/60 pt-3">
          <p className="text-sm font-medium text-black">
            {t("profile_page_socials_title")}
          </p>
          <SocialLinks
            socials={socials}
            itemClassName="flex h-8 w-8 items-center justify-center rounded-full border"
          />
        </div>
      )}
      <PoweredBy className="mt-3 text-sm font-normal text-gray220" />
    </div>
  );

  const logoutButton = isClickApp && hasAccess ? null : (
    <div className="mt-2 overflow-hidden rounded-2xl border border-gray180 bg-white">
      <Button
        type="button"
        variant="plain"
        size="none"
        onClick={handleAccountAction}
        className={`h-11 w-full gap-2 text-sm font-medium ${
          hasAccess ? "bg-red/10 text-red" : "bg-primary10 text-primary"
        }`}
      >
        {hasAccess ? <LogOut size={16} /> : <LogIn size={16} />}
        {hasAccess ? t("logout") : t("login")}
      </Button>
    </div>
  );

  return (
    <PageLayout>
      <section
        className={`fixed inset-0 overflow-y-auto bg-white px-4 pt-7 lg:hidden ${
          isClickApp ? "pb-29" : "pb-24"
        }`}
      >
        <div className="flex w-full flex-col">
          {accountCard}

          <ProfileGroup>
            {hasAccess && (
              <ProfileItem
                icon={IconPencilFilled}
                label={t("profile_page_menu_edit_profile")}
                onClick={() =>
                  router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)
                }
              />
            )}
            <ProfileItem
              icon={Package}
              label={t("order")}
              onClick={() => router.push(`${ROUTER.MY_ORDERS}${shopQuery}`)}
            />
            <ProfileItem
              icon={IconMapPinFilled}
              label={t("profile_page_menu_addresses")}
              onClick={() =>
                router.push(`${ROUTER.PROFILE_ADDRESSES}${shopQuery}`)
              }
            />
          </ProfileGroup>

          <ProfileGroup>
            <ProfileItem
              icon={IconBellFilled}
              label={t("profile_page_menu_notifications")}
              onClick={() =>
                router.push(`${ROUTER.PROFILE_NOTIFICATIONS}${shopQuery}`)
              }
            />
            {!isClickApp && (
              <ProfileItem
                icon={Globe2}
                label={t("profile_page_menu_language")}
                value={languageLabel}
                onClick={() => setLanguageOpen(true)}
              />
            )}
            <ProfileItem
              icon={IconHelpCircleFilled}
              label={t("about_us")}
              onClick={() => router.push(`${ROUTER.PROFILE_ABOUT}${shopQuery}`)}
            />
            <ProfileItem
              icon={IconMessageCircleFilled}
              label={t("profile_page_menu_contact_us")}
              onClick={openChat}
            />
          </ProfileGroup>

          {contactCard}
          {logoutButton}
        </div>

      </section>

      <ProfileDesktopLayout title={t("profile_page_menu_edit_profile")}>
        <EditProfileForm />
      </ProfileDesktopLayout>

      <LanguageSheet
        open={languageOpen}
        onClose={() => setLanguageOpen(false)}
      />

      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </PageLayout>
  );
};

export { Profile };

export default Profile;
