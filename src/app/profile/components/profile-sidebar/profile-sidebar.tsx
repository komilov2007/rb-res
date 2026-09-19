"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Edit3,
  Globe2,
  LogIn,
  MapPin,
  MessageCircle,
  Package,
} from "lucide-react";

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
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { useShopid } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";

import LanguageSheet from "../language-sheet";

const SidebarRow = ({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value?: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-11 w-full shrink-0 items-center gap-3 border-b border-gray180/60 px-2 text-left transition-colors last:border-b-0 ${
      active ? "font-bold text-black" : "text-black hover:bg-gray10"
    }`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
        active ? "bg-gray180 text-black" : "bg-gray10 text-gray220"
      }`}
    >
      <Icon size={16} />
    </span>
    <span
      className={`min-w-0 flex-1 truncate text-sm ${active ? "font-bold" : "font-medium"}`}
    >
      {label}
    </span>
    {value && (
      <span className="max-w-25 truncate text-xs font-medium text-gray220">
        {value}
      </span>
    )}
    <ChevronRight size={17} className="text-gray180" />
  </button>
);

// Desktop-only persistent left card for the whole profile family of routes
// (profile itself, addresses, notifications, about) — rendered by both
// profile.tsx and ProfilePageShell so it stays put while navigating between
// them. Fully self-contained (own data fetching, own modals) since it
// appears identically on every one of those pages. Mobile keeps its own
// inline account card + ProfileGroup/ProfileItem rows in profile.tsx
// instead of this component.
const ProfileSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { shopid } = useShopid();
  const locale = useLocale();
  const t = useTranslations();
  const { data, isLoading } = useProfile();
  const { data: general } = useGeneral();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasAccess = useAuthStore((state) => state.hasAccess) || isLeaving;
  const logout = useAuthStore((state) => state.logout);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const languageLabel =
    languages[locale as LanguageValue]?.label ?? languages.uz.label;
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";
  const homeHref = `/${shopQuery}`;

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

  return (
    <>
      <div className="flex w-96 shrink-0 flex-col gap-2">
        {/* Account card. */}
        <div className="rounded-2xl border border-gray180 bg-white p-3">
          {isLoading && hasAccess ? (
            <div className="flex items-center gap-4 p-2">
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
            <div className="flex w-full items-center gap-4 p-2 text-left">
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
                onClick={() =>
                  router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)
                }
                className="bg-gray10 text-gray220"
              >
                <Edit3 size={17} />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={setLoginModal(true, "/profile")}
              className="flex w-full items-center gap-4 p-2 text-left"
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

        {/* Personal actions. */}
        <div className="overflow-hidden rounded-2xl border border-gray180 bg-white">
          {hasAccess && (
            <SidebarRow
              icon={Edit3}
              label={t("profile_page.menu.edit_profile")}
              // Bare /profile now shows this same form by default in the
              // content pane (no more "Xush kelibsiz" placeholder), so it
              // reads as active there too, not just on /profile/edit itself.
              active={
                pathname === ROUTER.PROFILE || pathname === ROUTER.PROFILE_EDIT
              }
              onClick={() => router.push(`${ROUTER.PROFILE_EDIT}${shopQuery}`)}
            />
          )}
          {/* Desktop-only destination: /profile/orders shows the same
              order list inside this persistent sidebar's content pane
              instead of navigating out to /my-orders, which has no desktop
              layout of its own. Mobile's own "Buyurtmalarim" row (in
              profile.tsx) still goes to /my-orders, unchanged. */}
          <SidebarRow
            icon={Package}
            label={t("order")}
            active={pathname?.startsWith(ROUTER.PROFILE_ORDERS)}
            onClick={() => router.push(`${ROUTER.PROFILE_ORDERS}${shopQuery}`)}
          />
          <SidebarRow
            icon={MapPin}
            label={t("profile_page.menu.addresses")}
            active={pathname?.startsWith(ROUTER.PROFILE_ADDRESSES)}
            onClick={() =>
              router.push(`${ROUTER.PROFILE_ADDRESSES}${shopQuery}`)
            }
          />
        </div>

        {/* Info. */}
        <div className="overflow-hidden rounded-2xl border border-gray180 bg-white">
          <SidebarRow
            icon={Bell}
            label={t("profile_page.menu.notifications")}
            active={pathname?.startsWith(ROUTER.PROFILE_NOTIFICATIONS)}
            onClick={() =>
              router.push(`${ROUTER.PROFILE_NOTIFICATIONS}${shopQuery}`)
            }
          />
          <SidebarRow
            icon={Globe2}
            label={t("profile_page.menu.language")}
            value={languageLabel}
            onClick={() => setLanguageOpen(true)}
          />
          <SidebarRow
            icon={CircleHelp}
            label={t("about_us")}
            active={pathname?.startsWith(ROUTER.PROFILE_ABOUT)}
            onClick={() => router.push(`${ROUTER.PROFILE_ABOUT}${shopQuery}`)}
          />
          {/* Routes to the existing live chat feature — a real contact
              channel already in this app, not a new one. */}
          <SidebarRow
            icon={MessageCircle}
            label={t("profile_page.menu.contact_us")}
            active={pathname?.startsWith(ROUTER.CHAT)}
            onClick={() => router.push(`${ROUTER.CHAT}${shopQuery}`)}
          />
        </div>

        {/* Logout card — h-11, no padding around it, same as the other
            menu-group cards, so it isn't taller than them. */}
        <div className="overflow-hidden rounded-2xl border border-gray180 bg-white">
          <button
            type="button"
            onClick={
              hasAccess
                ? () => {
                    // Warm up home so leaving after "Chiqish" is quick.
                    router.prefetch(homeHref);
                    setLogoutOpen(true);
                  }
                : setLoginModal(true, "/profile")
            }
            className={`flex h-11 w-full items-center justify-center gap-2 text-sm font-bold ${
              hasAccess ? "text-red" : "text-primary"
            }`}
          >
            {!hasAccess && <LogIn size={16} />}
            {hasAccess ? t("logout") : t("login")}
          </button>
        </div>

        {/* Social/contact card. */}
        {(businessPhone || socials.length > 0) && (
          <div className="rounded-2xl border border-gray180 bg-white p-3">
            {businessPhone && (
              <a
                href={`tel:${businessPhone}`}
                className="flex min-h-10 items-center gap-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray10 text-gray220">
                  <MapPin size={16} />
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
              <div className={businessPhone ? "mt-3" : ""}>
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
                        className="flex h-10 w-10 items-center justify-center rounded-full border"
                        aria-label={formatSocialName(social.type)}
                      >
                        <Icon size={22} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="mt-3 text-xs font-normal text-gray220">
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
        )}
      </div>

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
    </>
  );
};

export default ProfileSidebar;
