"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PageLayout from "@/components/page-layout";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

import ProfileSidebar from "../profile-sidebar";

type ProfilePageShellProps = {
  title: string;
  children: ReactNode;
};

// Shared shell for profile sub-pages. Mobile keeps its own sticky back +
// title app-bar (PageLayout renders no mobile header of its own — every
// page owns that, the same way profile.tsx and my-orders.tsx do). Desktop
// gets PageLayout's site header/footer plus two separate cards — the
// persistent sidebar and this route's own content card — spanning up to
// home's max-w-7xl width, mirroring profile.tsx's own lg layout exactly.
const ProfilePageShell = ({
  title,
  children,
}: ProfilePageShellProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const goBackToProfile = () =>
    router.push(`${ROUTER.PROFILE}${shopid ? `?shop_id=${shopid}` : ""}`);

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col bg-gray10 lg:min-h-0">
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
            <h1 className="min-w-0 truncate text-base font-extrabold text-black">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-3 px-4 pb-6 pt-4 lg:hidden">
          {children}
        </div>

        <section className="hidden lg:block lg:bg-gray10 lg:px-4 lg:py-1.25">
          <div className="mx-auto flex w-full max-w-7xl gap-1.25">
            <ProfileSidebar />

            <div className="min-w-0 flex-1 rounded-2xl border border-gray180 bg-white p-6">
              <div className="flex items-center gap-3 pb-4">
                {/* No back arrow on desktop: every profile page is one click
                    away in the persistent sidebar. */}
                <h1 className="min-w-0 truncate text-lg font-medium text-black">
                  {title}
                </h1>
              </div>

              <div className="flex flex-col gap-3">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default ProfilePageShell;
