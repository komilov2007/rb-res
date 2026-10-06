"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Breadcrumb, { type BreadcrumbItem } from "@/components/breadcrumb";
import { ROUTER } from "@/constants/router";
import ProfileSidebar from "../profile-sidebar";
import { useTranslations as useTranslationsPoweredBy } from "next-intl";
import type { ComponentType, ReactNode as ReactNodeProfileItem } from "react";
import { ChevronRight } from "lucide-react";

type ProfileDesktopLayoutProps = {
  title: string;
  current?: string;
  children: ReactNode;
  footer?: ReactNode;
};

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

const PoweredBy = ({ className }: { className: string }) => {
  const t = useTranslationsPoweredBy();

  return (
    <p className={className}>
      {t.rich("profile_page_powered_by", {
        link: (chunks) => (
          <a
            href="https://robosell.uz/"
            target="_blank"
            rel="noopener noreferrer"
            className="!text-robosell"
          >
            {chunks}
          </a>
        ),
      })}
    </p>
  );
};

export const ProfileGroup = ({
  children,
  className = "",
}: {
  children: ReactNodeProfileItem;
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
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  onClick?: () => void;
};

export const ProfileItem = ({
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
      <span className="info-label min-w-0 flex-1 truncate">
        {label}
      </span>
      {value && (
        <span className="max-w-[110px] truncate text-[13px] font-medium text-gray220/70">
          {value}
        </span>
      )}
      <ChevronRight size={17} className="text-gray180" />
    </button>
  );
};

export { PoweredBy };
