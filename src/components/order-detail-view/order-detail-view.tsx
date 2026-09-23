"use client";

import { ChevronLeft, Headphones } from "lucide-react";
import { IconClockFilled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";

import CancelOrder from "@/components/cancel-order";
import OrderDetailSections from "@/components/order-detail-sections";
import RetryPayment from "@/components/retry-payment";
import Button from "@/components/ui/button";
import type { OrderDetailState } from "@/hooks/useOrderDetail";
import { useOpenChat } from "@/hooks/useOpenChat";
import { formatOrderDate } from "@/utils/format-date";

// A section's small icon + caption line (SectionLabel).
const LabelSkeleton = ({ width }: { width: string }) => (
  <div className="flex h-4 items-center gap-2">
    <div className="skeleton h-3.25 w-3.25 rounded" />
    <div className={`skeleton h-2.5 rounded-full ${width}`} />
  </div>
);

// One InfoRow: label left, value right, text-sm line height.
const RowSkeleton = ({ label, value }: { label: string; value: string }) => (
  <div className="flex h-5 items-center justify-between">
    <div className={`skeleton h-3 rounded-full ${label}`} />
    <div className={`skeleton h-3 rounded-full ${value}`} />
  </div>
);

// Mirrors the loaded page block for block — same wrapper, the same four
// divider-separated sections (status timeline, address, items, payment)
// with their real paddings and line heights, and the two action buttons —
// so nothing jumps when the order arrives.
const OrderDetailSkeleton = () => (
  <div className="mx-auto flex w-full max-w-xl flex-1 flex-col pt-[calc(68px+env(safe-area-inset-top))] pb-6">
    <div className="flex flex-col divide-y divide-gray180 px-4">
      {/* Status timeline: 4 steps (28px dot + 2-line caption), lines between. */}
      <section className="py-5">
        <div className="flex items-start">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-1 items-start last:flex-none">
              <div className="flex w-16 flex-col items-center gap-2">
                <div className="skeleton h-7 w-7 rounded-full" />
                {/* Captions wrap to two 11px lines (e.g. "Qabul / qilindi"). */}
                <div className="flex h-7 flex-col items-center justify-center gap-1.5">
                  <div className="skeleton h-2.5 w-12 rounded-full" />
                  <div className="skeleton h-2.5 w-8 rounded-full" />
                </div>
              </div>
              {index < 3 && <div className="skeleton mt-3.25 h-px flex-1" />}
            </div>
          ))}
        </div>
      </section>

      {/* Address: caption, then the icon + name/address row. */}
      <section className="py-5">
        <LabelSkeleton width="w-28" />
        <div className="mt-3 flex items-start gap-3">
          <div className="skeleton h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex h-5 items-center">
              <div className="skeleton h-3.5 w-40 rounded-full" />
            </div>
            <div className="mt-0.5 flex h-4 items-center">
              <div className="skeleton h-3 w-56 max-w-full rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Items: 48px photo, name + count, price. */}
      <section className="py-5">
        <LabelSkeleton width="w-24" />
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="skeleton h-12 w-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex h-5 items-center">
                  <div className="skeleton h-3.5 w-32 rounded-full" />
                </div>
                <div className="flex h-4 items-center">
                  <div className="skeleton h-3 w-14 rounded-full" />
                </div>
              </div>
              <div className="skeleton h-3.5 w-20 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Payment: caption, the 4 always-shown rows (delivery price and
          discount only appear when they apply), divider, total. */}
      <section className="py-5">
        <LabelSkeleton width="w-28" />
        <div className="mt-3 flex flex-col gap-2.5">
          <RowSkeleton label="w-24" value="w-20" />
          <RowSkeleton label="w-20" value="w-16" />
          <RowSkeleton label="w-24" value="w-24" />
          <RowSkeleton label="w-28" value="w-16" />
        </div>
        <div className="mt-3 flex h-7 items-center justify-between border-t border-gray180 pt-3 box-content">
          <div className="skeleton h-3.5 w-20 rounded-full" />
          <div className="skeleton h-5 w-32 rounded-full" />
        </div>
      </section>
    </div>

    {/* Pay / cancel buttons. */}
    <div className="mt-4 flex flex-col gap-2.5 px-4">
      <div className="skeleton h-12 w-full rounded-xl" />
      <div className="skeleton h-12 w-full rounded-xl" />
    </div>
  </div>
);

type OrderDetailViewProps = OrderDetailState & {
  onBack: () => void;
};

// The order detail page shared by my-orders/[order] and order-placing/[order]
// — header, OrderDetailSections, RetryPayment, CancelOrder — so an order
// opened from "Buyurtmalarim" looks identical to one just placed. The two
// routes differ only in where "back" goes.
const OrderDetailView = ({
  orderId,
  detail,
  isLoading,
  isError,
  cancelOrder,
  isCancelling,
  cancelError,
  proceedToPayment,
  isPaying,
  onBack,
}: OrderDetailViewProps) => {
  const t = useTranslations();
  const openChat = useOpenChat();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="fixed inset-x-0 top-0 z-10 border-b border-gray180 bg-white">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-3">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={onBack}
            className="shrink-0 text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-base font-medium text-black">
              {t("orders_title_number", { id: orderId })}
            </h1>
            {detail ? (
              <p className="mt-0.5 flex items-center justify-center gap-2 text-xs font-medium text-gray220">
                <IconClockFilled size={11} />
                {formatOrderDate(detail.status.datetime)}
              </p>
            ) : (
              isLoading && (
                <div className="mt-0.5 flex h-4 items-center justify-center">
                  <div className="skeleton h-3 w-28 rounded-full" />
                </div>
              )
            )}
          </div>
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={openChat}
            aria-label={t("orders_support")}
            className="shrink-0 text-black"
          >
            <Headphones size={20} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : isError || !detail ? (
        <div className="mx-auto w-full max-w-xl px-4 pt-[calc(68px+env(safe-area-inset-top))]">
          <p className="text-sm font-medium text-gray220">
            {t("orders_not_found")}
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col pt-[calc(68px+env(safe-area-inset-top))] pb-6">
          <OrderDetailSections detail={detail} />

          <div className="mt-4 flex flex-col gap-2.5 px-4">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailView;
