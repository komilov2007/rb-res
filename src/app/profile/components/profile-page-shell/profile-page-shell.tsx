"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PageLayout from "@/components/page-layout";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

import ProfileDesktopLayout from "../profile-desktop-layout";

type ProfilePageShellProps = {
  title: string;
  children: ReactNode;
  // Desktop: pinned under the scrolling content. Mobile: after it.
  footer?: ReactNode;
};

// Shared shell for profile sub-pages. Mobile keeps its own sticky back +
// title app-bar (PageLayout renders no mobile header of its own — every
// page owns that, the same way profile.tsx and my-orders.tsx do). Desktop
// gets PageLayout's site header/footer plus ProfileDesktopLayout — the same
// breadcrumb + sidebar/content panels profile.tsx renders.
const ProfilePageShell = ({
  title,
  children,
  footer,
}: ProfilePageShellProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const goBackToProfile = () =>
    router.push(`${ROUTER.PROFILE}${shopid ? `?shop_id=${shopid}` : ""}`);

  return (
    <PageLayout>
      {/* No min-h-screen here: PageLayout is already min-h-screen and adds
          the bottom-nav padding on top, so a second one made every page
          ~82px taller than the screen — it scrolled even with one item. */}
      <div className="flex flex-col bg-gray10">
        <div className="sticky top-0 z-30 rounded-b-2xl border-b border-gray180 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="flex w-full items-center gap-3 px-4 py-4">
            <Button
              type="button"
              variant="plain"
              size="none"
              onClick={goBackToProfile}
              aria-label={t("common_back")}
              className="text-black"
            >
              <ChevronLeft size={22} />
            </Button>
            <h1 className="min-w-0 truncate text-base font-medium text-black">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-2 px-4 py-2 lg:hidden">
          {children}
          {footer}
        </div>

        <ProfileDesktopLayout title={title} current={title} footer={footer}>
          {children}
        </ProfileDesktopLayout>
      </div>
    </PageLayout>
  );
};

export default ProfilePageShell;
