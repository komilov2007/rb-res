"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { getNotifications, normalizeNotifications } from "@/apis/notification";
import Button from "@/components/ui/button";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { formatOrderDate } from "@/utils/format-date";

import LoginRequired from "../components/login-required";
import ProfilePageShell from "../components/profile-page-shell";

const NotificationSkeleton = () => (
  <div className="flex animate-pulse items-start gap-3 rounded-2xl border border-gray180 bg-white p-3">
    <div className="h-9 w-9 shrink-0 rounded-full bg-gray10" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-32 rounded-full bg-gray10" />
      <div className="h-3 w-full rounded-full bg-gray10" />
      <div className="h-3 w-20 rounded-full bg-gray10" />
    </div>
  </div>
);

const NotificationsContent = () => {
  const t = useTranslations();
  const { shopid, hasShopId } = useShopId();
  const customerId = useAuthStore((state) => state.auth?.customer);
  const hasAccess = useAuthStore((state) => state.hasAccess);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    enabled: hasShopId && hasAccess,
    queryKey: ["notifications", shopid, customerId],
    queryFn: () => getNotifications(shopid as string),
  });

  if (!hasAccess) {
    return (
      <LoginRequired message={t("profile_page_notifications_login_required")} />
    );
  }

  if (isLoading) {
    return (
      <>
        <NotificationSkeleton />
        <NotificationSkeleton />
        <NotificationSkeleton />
      </>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray180 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-gray220">
          {t("profile_page_notifications_load_error")}
        </p>
        <Button
          type="button"
          variant="plain"
          size="none"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="h-10 rounded-xl bg-gray10 px-4 text-sm font-bold text-black"
        >
          {t("common_retry")}
        </Button>
      </div>
    );
  }

  const notifications = normalizeNotifications(data?.data);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray180 bg-white px-6 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gray10 text-gray220">
          <BellOff size={24} />
        </span>
        <p className="text-base font-bold text-black">
          {t("profile_page_notifications_empty")}
        </p>
      </div>
    );
  }

  return (
    <>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          data-notification
          className="flex items-start gap-3 rounded-2xl border border-gray180 bg-white p-3"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
            <Bell size={16} />
          </span>
          <div className="min-w-0 flex-1">
            {notification.title && (
              <p className="text-sm font-medium text-black">
                {notification.title}
              </p>
            )}
            {notification.body && (
              <p className="mt-0.5 whitespace-pre-line text-sm text-gray220">
                {notification.body}
              </p>
            )}
            {notification.date && (
              <p className="mt-1.5 text-xs text-gray220">
                {formatOrderDate(notification.date)}
              </p>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

const Notifications = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("profile_page_menu_notifications")}>
      {/* useSearchParams (shop_id) needs a Suspense boundary. */}
      <Suspense>
        <NotificationsContent />
      </Suspense>
    </ProfilePageShell>
  );
};

export default Notifications;
