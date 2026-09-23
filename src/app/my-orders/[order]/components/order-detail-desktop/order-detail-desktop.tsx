"use client";

import { Headphones } from "lucide-react";
import { IconClockFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import CancelOrder from "@/components/cancel-order";
import Footer from "@/components/footer";
import Header from "@/components/header";
import OrderDetailSections from "@/components/order-detail-sections";
import RetryPayment from "@/components/retry-payment";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import type { OrderDetailState } from "@/hooks/useOrderDetail";
import { useOpenChat } from "@/hooks/useOpenChat";
import { formatOrderDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";

import StatusBadge from "@/app/my-orders/components/status-badge";
import Breadcrumb from "@/components/breadcrumb";

const OrderDetailDesktopSkeleton = () => (
  <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
    <div className="flex flex-col gap-4 rounded-2xl border border-gray180 bg-white p-6">
      <div className="h-16 animate-pulse rounded-xl bg-gray10" />
      <div className="h-32 animate-pulse rounded-xl bg-gray10" />
      <div className="h-24 animate-pulse rounded-xl bg-gray10" />
    </div>
    <div className="h-64 animate-pulse rounded-2xl border border-gray180 bg-white" />
  </div>
);

// Desktop (lg+) order detail: site header/footer shell, details on the left
// (the same shared OrderDetailSections mobile uses) and a sticky summary
// card with the order's actions on the right. Mobile keeps OrderDetailView.
const OrderDetailDesktop = ({
  orderId,
  detail,
  isLoading,
  isError,
  cancelOrder,
  isCancelling,
  cancelError,
  proceedToPayment,
  isPaying,
}: OrderDetailState) => {
  const t = useTranslations();
  const openChat = useOpenChat();
  const title = t("orders_title_number", { id: orderId });

  return (
    <div className="flex min-h-screen flex-col bg-gray10">
      <Header />
      <Breadcrumb
        items={[{ label: t("order"), href: ROUTER.MY_ORDERS }, { label: title }]}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-3">
        {isLoading ? (
          <OrderDetailDesktopSkeleton />
        ) : isError || !detail ? (
          <p className="py-10 text-center text-sm font-medium text-gray220">
            {t("orders_not_found")}
          </p>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
            <div className="rounded-2xl border border-gray180 bg-white px-2 py-1">
              <OrderDetailSections detail={detail} />
            </div>

            <aside className="sticky top-6 flex flex-col gap-4 rounded-2xl border border-gray180 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-medium text-black">
                    {title}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray220">
                    <IconClockFilled size={12} />
                    {formatOrderDate(detail.status.datetime)}
                  </p>
                </div>
                <StatusBadge status={detail.status.status} size="md" showDot />
              </div>

              <div className="flex items-center justify-between border-t border-gray180 pt-4">
                <span className="text-sm font-medium text-gray220">
                  {t("orders_detail_total_payment")}
                </span>
                <span className="text-xl font-medium text-black">
                  {formatPrice(Number(detail.amount))} {t("sum")}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <RetryPayment
                  amount={Number(detail.amount)}
                  isPaid={detail.is_paid}
                  status={detail.status.status}
                  onRetry={proceedToPayment}
                  isPaying={isPaying}
                />

                <CancelOrder
                  status={detail.status.status}
                  onCancel={cancelOrder}
                  isCancelling={isCancelling}
                  cancelError={cancelError}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="primaryWide"
                  onClick={openChat}
                  className="font-medium"
                >
                  <Headphones size={17} />
                  {t("orders_support")}
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetailDesktop;
