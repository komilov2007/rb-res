"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe2, LogIn, Package } from "lucide-react";
import { IconBellFilled, IconHelpCircleFilled, IconMapPinFilled, IconMessageCircleFilled, IconPencilFilled } from "@tabler/icons-react";

import { ROUTER } from "@/constants/router";
import { useIsClick } from "@/hooks/useIsClick";
import { useOpenChat } from "@/hooks/useOpenChat";
import { useUiStore } from "@/stores/ui";

import { useProfileAccount } from "@/app/profile/components/profile";
import AccountCard from "../account-card";
import LogoutDialog from "../logout-dialog";
import { SidebarContact } from "./sidebar-contact";
import { SidebarRow, SIDEBAR_GROUP_CLASS_NAME } from "./sidebar-contact";

const ProfileSidebar = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const openChat = useOpenChat();
  const isChatModalOpen = useUiStore((state) => state.isChatModalOpen);
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
    logoutOpen,
    setLogoutOpen,
    openLogin,
    handleAccountAction,
    handleLogout,
  } = useProfileAccount();

  return (
    <>
      <div className="flex w-96 shrink-0 flex-col divide-y divide-gray180">
        <AccountCard
          variant="sidebar"
          isLoading={isLoading}
          hasAccess={hasAccess}
          initials={initials}
          name={name}
          phone={phone}
          onEdit={() => router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)}
          onLogin={openLogin}
        />

        <div className={SIDEBAR_GROUP_CLASS_NAME}>
          {hasAccess && (
            <SidebarRow
              icon={IconPencilFilled}
              label={t("profile_page_menu_edit_profile")}
              active={
                pathname === ROUTER.PROFILE || pathname === ROUTER.PROFILE_EDIT
              }
              onClick={() => router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)}
            />
          )}
          <SidebarRow
            icon={Package}
            label={t("order")}
            active={pathname?.startsWith(ROUTER.PROFILE_ORDERS)}
            onClick={() => router.push(`${ROUTER.PROFILE_ORDERS}${shopQuery}`)}
          />
          <SidebarRow
            icon={IconMapPinFilled}
            label={t("profile_page_menu_addresses")}
            active={pathname?.startsWith(ROUTER.PROFILE_ADDRESSES)}
            onClick={() =>
              router.push(`${ROUTER.PROFILE_ADDRESSES}${shopQuery}`)
            }
          />
        </div>

        <div className={SIDEBAR_GROUP_CLASS_NAME}>
          <SidebarRow
            icon={IconBellFilled}
            label={t("profile_page_menu_notifications")}
            active={pathname?.startsWith(ROUTER.PROFILE_NOTIFICATIONS)}
            onClick={() =>
              router.push(`${ROUTER.PROFILE_NOTIFICATIONS}${shopQuery}`)
            }
          />
          {!isClickApp && (
            <SidebarRow
              icon={Globe2}
              label={t("profile_page_menu_language")}
              value={languageLabel}
              active={pathname?.startsWith(ROUTER.PROFILE_LANGUAGE)}
              onClick={() =>
                router.push(`${ROUTER.PROFILE_LANGUAGE}${shopQuery}`)
              }
            />
          )}
          <SidebarRow
            icon={IconHelpCircleFilled}
            label={t("about_us")}
            active={pathname?.startsWith(ROUTER.PROFILE_ABOUT)}
            onClick={() => router.push(`${ROUTER.PROFILE_ABOUT}${shopQuery}`)}
          />
          <SidebarRow
            icon={IconMessageCircleFilled}
            label={t("profile_page_menu_contact_us")}
            active={isChatModalOpen}
            onClick={openChat}
          />
        </div>

        {!(isClickApp && hasAccess) && (
          <div className={SIDEBAR_GROUP_CLASS_NAME}>
            <button
              type="button"
              onClick={handleAccountAction}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 ${
                hasAccess
                  ? "text-red hover:bg-red/10 focus-visible:ring-red/40"
                  : "text-primary hover:bg-primary10 focus-visible:ring-primary/40"
              }`}
            >
              {!hasAccess && <LogIn size={16} />}
              {hasAccess ? t("logout") : t("login")}
            </button>
          </div>
        )}

        <SidebarContact businessPhone={businessPhone} socials={socials} />
      </div>

      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default ProfileSidebar;
