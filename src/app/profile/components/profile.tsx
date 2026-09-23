"use client";

import { Globe2, LogIn, LogOut, Package } from "lucide-react";
import { IconBellFilled, IconHelpCircleFilled, IconMapPinFilled, IconMessageCircleFilled, IconPencilFilled, IconPhoneFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import PageLayout from "@/components/page-layout";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useOpenChat } from "@/hooks/useOpenChat";

import { useProfileAccount } from "../useProfileAccount";
import AccountCard from "./account-card";
import EditProfileForm from "./edit-profile-form";
import LanguageSheet from "./language-sheet";
import LogoutDialog from "./logout-dialog";
import PoweredBy from "./powered-by";
import { ProfileGroup, ProfileItem } from "./profile-item";
import ProfileDesktopLayout from "./profile-desktop-layout";
import SocialLinks from "./social-links";

const Profile = () => {
  const t = useTranslations();
  const openChat = useOpenChat();
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

  // Its own card (matching the reference layout's isolated "Chiqish" card)
  // instead of a bare button floating between the menu groups and the
  // contact card. h-11 with no padding around it — same as a plain
  // ProfileItem row — so this card isn't taller than the menu group cards.
  const logoutButton = (
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
      {/* Mobile: single stacked card, own white bg via the section itself.
          Natural height (no h-full) — the cards keep their full size and
          the section scrolls on short screens instead of squeezing them. */}
      <section className="fixed inset-0 overflow-y-auto bg-white px-4 pb-24 pt-7 lg:hidden">
        <div className="flex w-full flex-col">
          {accountCard}

          {/* Personal actions. */}
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

          {/* Info. */}
          <ProfileGroup>
            <ProfileItem
              icon={IconBellFilled}
              label={t("profile_page_menu_notifications")}
              onClick={() =>
                router.push(`${ROUTER.PROFILE_NOTIFICATIONS}${shopQuery}`)
              }
            />
            <ProfileItem
              icon={Globe2}
              label={t("profile_page_menu_language")}
              value={languageLabel}
              onClick={() => setLanguageOpen(true)}
            />
            <ProfileItem
              icon={IconHelpCircleFilled}
              label={t("about_us")}
              onClick={() => router.push(`${ROUTER.PROFILE_ABOUT}${shopQuery}`)}
            />
            {/* Routes to the existing live chat feature — a real contact
                channel already in this app, not a new one. */}
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

      {/* Desktop: the persistent sidebar owns the account summary, logout
          and contact/social info. The bare /profile route's content pane
          shows the edit-profile form by default — "Profilni tahrirlash" is
          effectively this route's default selected section, matching the
          sidebar's own active-row highlighting for it. */}
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

export default Profile;
