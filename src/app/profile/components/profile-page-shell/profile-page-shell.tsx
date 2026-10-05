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
  footer?: ReactNode;
};

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
