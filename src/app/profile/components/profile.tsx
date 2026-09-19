"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Edit3,
  Globe2,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import PageLayout from "@/app/[page]/components/page-layout";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { languages, type LanguageValue } from "@/constants/language";
import { ROUTER } from "@/constants/router";
import { clearUser } from "@/lib/user";
import { useShopid } from "@/hooks/useShopId";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/auth";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";

import EditProfileForm from "./edit-profile-form";
import LanguageSheet from "./language-sheet";
import ProfileSidebar from "./profile-sidebar";

const Profile = () => {
  const router = useRouter();
  const { shopid } = useShopid();
  const { data, isLoading } = useProfile();
  const { data: general } = useGeneral();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations();
  const languageLabel =
    languages[locale as LanguageValue]?.label ?? languages.uz.label;
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";
  const homeHref = `/${shopQuery}`;
  // After confirming logout the page keeps its logged-in look until the home
  // page replaces it — otherwise the guest view flashes during navigation.
  const hasAccess = useAuthStore((state) => state.hasAccess) || isLeaving;
  const logout = useAuthStore((state) => state.logout);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const profile = data?.data;
  const name = hasAccess
    ? profile?.firstname || t("profile_page.user_fallback")
    : t("login");
  const phone = hasAccess
    ? profile?.phone || "-"
    : t("profile_page.login_prompt");
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
  const businessPhone = general?.data.business_phone;
  const socials = general?.data.socials ?? [];

  const handleLogout = () => {
    setIsLeaving(true);
    setLogoutOpen(false);
    clearUser(shopid);
    logout();
    router.push(homeHref);
  };

  const accountCard = (
    <div className="rounded-2xl border border-gray180 bg-white p-2">
      {isLoading && hasAccess ? (
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gray10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 rounded-full bg-gray10" />
            <div className="h-3 w-28 rounded-full bg-gray10" />
          </div>
        </div>
      ) : hasAccess ? (
        // A plain div, not a button: the edit icon below is the only
        // interactive control in this state, and a <button> wrapping
        // another <button> is invalid HTML (React 19 flags it as a
        // hydration error).
        <div className="flex w-full items-center gap-4 text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary10 text-sm font-bold text-primary">
            {initials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-black">{name}</p>
            <p className="mt-1 truncate text-xs font-normal text-gray220">
              {phone}
            </p>
          </div>
          <Button
            type="button"
            variant="icon-solid"
            size="icon-lg"
            aria-label={t("profile_page.menu.edit_profile")}
            onClick={() => router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)}
            className="bg-gray10 text-gray220"
          >
            <Edit3 size={17} />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={setLoginModal(true, "/profile")}
          className="flex w-full items-center gap-4 text-left"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary10 text-sm font-bold text-primary">
            {initials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-black">{name}</p>
            <p className="mt-1 truncate text-xs font-normal text-gray220">
              {phone}
            </p>
          </div>
        </button>
      )}
    </div>
  );

  const contactCard = (
    <div className="mt-2 rounded-2xl border border-gray180 bg-white px-2 py-3">
      {businessPhone && (
        <a
          href={`tel:${businessPhone}`}
          className="flex min-h-10 items-center gap-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray10 text-gray220">
            <Phone size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal text-gray220">
              {t("profile_page.contact_label")}
            </p>
            <p className="truncate text-sm font-medium text-[#3D3D3D]">
              {businessPhone}
            </p>
          </div>
        </a>
      )}

      {socials.length > 0 && (
        <div className="mt-3 border-t border-gray180/60 pt-3">
          <p className="text-sm font-bold text-black">
            {t("profile_page.socials_title")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {socials.map((social) => {
              const Icon = getSocialIcon(social.type);
              const style = getSocialStyle(social.type);

              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: style.color,
                    borderColor: style.borderColor,
                    backgroundColor: style.backgroundColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border"
                  aria-label={formatSocialName(social.type)}
                >
                  <Icon size={22} />
                </a>
              );
            })}
          </div>
        </div>
      )}
      <p className="mt-3 text-sm font-normal text-gray220">
        {t.rich("profile_page.powered_by", {
          link: (chunks) => (
            <a
              href="https://robosell.uz/"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-primary"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
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
        onClick={
          hasAccess
            ? () => {
                // Warm up home so leaving after "Chiqish" is quick.
                router.prefetch(homeHref);
                setLogoutOpen(true);
              }
            : setLoginModal(true, "/profile")
        }
        className={`h-11 w-full gap-2 text-sm font-bold ${
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
      <section className="fixed inset-0 overflow-hidden bg-white px-4 pb-24 pt-7 lg:static lg:overflow-visible lg:bg-gray10 lg:px-4 lg:py-1.25">
        {/* Mobile: single stacked card, own white bg via the section itself. */}
        <div className="flex h-full w-full flex-col overflow-hidden lg:hidden">
          {accountCard}

          {/* Personal actions. */}
          <ProfileGroup>
            {hasAccess && (
              <ProfileItem
                icon={Edit3}
                label={t("profile_page.menu.edit_profile")}
                onClick={() =>
                  router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)
                }
              />
            )}
            <ProfileItem
              icon={Package}
              label={t("order")}
              onClick={() =>
                router.push(
                  `${ROUTER.MY_ORDERS}${shopid ? `?shop_id=${shopid}` : ""}`,
                )
              }
            />
            <ProfileItem
              icon={MapPin}
              label={t("profile_page.menu.addresses")}
              onClick={() =>
                router.push(`${ROUTER.PROFILE_ADDRESSES}${shopQuery}`)
              }
            />
          </ProfileGroup>

          {/* Info. */}
          <ProfileGroup>
            <ProfileItem
              icon={Bell}
              label={t("profile_page.menu.notifications")}
              onClick={() =>
                router.push(`${ROUTER.PROFILE_NOTIFICATIONS}${shopQuery}`)
              }
            />
            <ProfileItem
              icon={Globe2}
              label={t("profile_page.menu.language")}
              value={languageLabel}
              onClick={() => setLanguageOpen(true)}
            />
            <ProfileItem
              icon={CircleHelp}
              label={t("about_us")}
              onClick={() => router.push(`${ROUTER.PROFILE_ABOUT}${shopQuery}`)}
            />
            {/* Routes to the existing live chat feature — a real contact
                channel already in this app, not a new one. */}
            <ProfileItem
              icon={MessageCircle}
              label={t("profile_page.menu.contact_us")}
              onClick={() => router.push(`${ROUTER.CHAT}${shopQuery}`)}
            />
          </ProfileGroup>

          {contactCard}
          {logoutButton}
        </div>

        {/* Desktop: two separate cards side by side (matches the reference
            layout) sitting on the page's own gray background, spanning up
            to home's max-w-7xl width instead of one small card floating
            alone on the page. The sidebar owns the account summary,
            logout and contact/social info itself now (it's persistent
            across every profile route). The bare /profile route's content
            pane shows the edit-profile form by default (no more "Xush
            kelibsiz" placeholder) — "Profilni tahrirlash" is effectively
            this route's default selected section, matching the sidebar's
            own active-row highlighting for it. */}
        <div className="mx-auto hidden w-full max-w-7xl gap-1.25 lg:flex">
          <ProfileSidebar />

          <div className="min-w-0 flex-1 rounded-2xl border border-gray180 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-black">
              {t("profile_page.menu.edit_profile")}
            </h2>
            <EditProfileForm />
          </div>
        </div>
      </section>

      <LanguageSheet
        open={languageOpen}
        onClose={() => setLanguageOpen(false)}
      />

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent
          className="max-w-[340px] rounded-3xl bg-white p-5"
          showCloseButton={false}
        >
          <DialogTitle className="text-center text-xl font-bold text-black">
            {t("profile_page.logout_dialog.title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-normal text-gray220">
            {t("profile_page.logout_dialog.description")}
          </DialogDescription>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setLogoutOpen(false)}
              className="rounded-2xl"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="plain"
              size="lg"
              onClick={handleLogout}
              className="rounded-2xl bg-red/10 text-red"
            >
              {t("logout")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

const ProfileGroup = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`mt-2 overflow-hidden rounded-2xl border border-gray180 bg-white ${className}`}
    >
      {children}
    </div>
  );
};

type ProfileItemProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  onClick?: () => void;
};

const ProfileItem = ({
  icon: Icon,
  label,
  value,
  onClick,
}: ProfileItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-3 border-b border-gray180/60 px-2 text-left last:border-b-0"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray10 text-gray220">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
        {label}
      </span>
      {value && (
        <span className="max-w-[110px] truncate text-xs font-medium text-gray220">
          {value}
        </span>
      )}
      <ChevronRight size={17} className="text-gray180" />
    </button>
  );
};

export default Profile;
