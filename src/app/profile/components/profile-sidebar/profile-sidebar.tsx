"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe2, LogIn, Package } from "lucide-react";
import { IconBellFilled, IconHelpCircleFilled, IconMapPinFilled, IconMessageCircleFilled, IconPencilFilled } from "@tabler/icons-react";

import { ROUTER } from "@/constants/router";
import { useOpenChat } from "@/hooks/useOpenChat";
import { useUiStore } from "@/stores/ui";

import { useProfileAccount } from "../../useProfileAccount";
import AccountCard from "../account-card";
import LogoutDialog from "../logout-dialog";
import SidebarContact from "./sidebar-contact";
import SidebarRow, { SIDEBAR_GROUP_CLASS_NAME } from "./sidebar-row";

// Desktop-only persistent left panel for the whole profile family of routes
// (profile itself, addresses, notifications, about) — rendered by both
// profile.tsx and ProfilePageShell so it stays put while navigating between
// them. Fully self-contained (own data fetching, own modals) since it
// appears identically on every one of those pages. Mobile keeps its own
// inline account card + ProfileGroup/ProfileItem rows in profile.tsx
// instead of this component.
const ProfileSidebar = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const openChat = useOpenChat();
  const isChatModalOpen = useUiStore((state) => state.isChatModalOpen);
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
        {/* Account card. */}
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

        {/* Personal actions. */}
        <div className={SIDEBAR_GROUP_CLASS_NAME}>
          {hasAccess && (
            <SidebarRow
              icon={IconPencilFilled}
              label={t("profile_page_menu_edit_profile")}
              // Bare /profile shows this same form by default in the content
              // pane, so it reads as active there too, not just on
              // /profile/edit itself.
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

        {/* Info. */}
        <div className={SIDEBAR_GROUP_CLASS_NAME}>
          <SidebarRow
            icon={IconBellFilled}
            label={t("profile_page_menu_notifications")}
            active={pathname?.startsWith(ROUTER.PROFILE_NOTIFICATIONS)}
            onClick={() =>
              router.push(`${ROUTER.PROFILE_NOTIFICATIONS}${shopQuery}`)
            }
          />
          {/* Desktop opens its own page (mobile keeps the sheet). */}
          <SidebarRow
            icon={Globe2}
            label={t("profile_page_menu_language")}
            value={languageLabel}
            active={pathname?.startsWith(ROUTER.PROFILE_LANGUAGE)}
            onClick={() =>
              router.push(`${ROUTER.PROFILE_LANGUAGE}${shopQuery}`)
            }
          />
          <SidebarRow
            icon={IconHelpCircleFilled}
            label={t("about_us")}
            active={pathname?.startsWith(ROUTER.PROFILE_ABOUT)}
            onClick={() => router.push(`${ROUTER.PROFILE_ABOUT}${shopQuery}`)}
          />
          {/* Routes to the existing live chat feature — a real contact
              channel already in this app, not a new one. */}
          <SidebarRow
            icon={IconMessageCircleFilled}
            label={t("profile_page_menu_contact_us")}
            active={isChatModalOpen}
            onClick={openChat}
          />
        </div>

        {/* Logout section — same padded group as the menus above, with
            its own tinted hover (red for logout, primary for login). */}
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
