"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import Breadcrumb, { type BreadcrumbItem } from "@/components/breadcrumb";
import { ROUTER } from "@/constants/router";

import ProfileSidebar from "../profile-sidebar";

type ProfileDesktopLayoutProps = {
  title: string;
  // The current sub-page's breadcrumb label; omitted on the bare /profile
  // route, where "Profil" itself is the current page.
  current?: string;
  children: ReactNode;
  // Pinned under the scrolling content (e.g. "add address").
  footer?: ReactNode;
};

// Desktop-only shell shared by /profile and every profile sub-page:
// breadcrumb under the header, then two full-bleed white panels with an 8px
// gray gap — the persistent sidebar left, this route's content right. Each
// panel pads its outer side by max(20px, 50% - 620px) so the content lines
// up with the header's max-w-7xl container (same as the order page).
// The panels are capped to the viewport (min 520px): long content (e.g. many
// orders) scrolls inside the right panel instead of growing the page.
const ProfileDesktopLayout = ({
  title,
  current,
  children,
  footer,
}: ProfileDesktopLayoutProps) => {
  const t = useTranslations();
  const breadcrumb: BreadcrumbItem[] = current
    ? [{ label: t("profile"), href: ROUTER.PROFILE }, { label: current }]
    : [{ label: t("profile") }];

  return (
    <div className="hidden lg:block">
      <Breadcrumb items={breadcrumb} />

      <section className="flex h-[max(520px,calc(100dvh-171px))] gap-2 pt-2">
        <div className="scroll-hidden w-[calc(max(20px,50%-620px)+384px+24px)] shrink-0 overflow-y-auto rounded-r-[30px] bg-white py-2 pl-[max(20px,calc(50%-620px))] pr-6">
          <ProfileSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col rounded-l-[30px] bg-white py-5 pl-6 pr-[max(20px,calc(50%-620px))]">
          {/* No back arrow on desktop: every profile page is one click
              away in the persistent sidebar. */}
          <h1 className="shrink-0 truncate pb-4 text-xl font-medium text-black">
            {title}
          </h1>

          <div className="scroll-panel -mr-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-3">
            {children}
          </div>

          {footer && (
            <div className="shrink-0 [&:not(:empty)]:pt-3">{footer}</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileDesktopLayout;
