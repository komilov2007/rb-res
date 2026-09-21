"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

import CancelOrder from "@/components/cancel-order";
import OrderDetailSections from "@/components/order-detail-sections";
import RetryPayment from "@/components/retry-payment";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useShopid } from "@/hooks/useShopId";
import { formatOrderDate } from "@/utils/format-date";

import { useMyOrderDetail } from "../../useMyOrderDetail";

// Same divider-separated skeleton shape as order-placing's own
// OrderPlacingSkeleton — the two routes now share the same detail layout.
const MyOrderDetailSkeleton = () => (
  <div className="mx-auto w-full max-w-xl px-4 pt-[calc(68px+env(safe-area-inset-top))]">
    <div className="border-b border-gray180 py-4">
      <div className="h-16 animate-pulse rounded-xl bg-gray10" />
    </div>
    <div className="border-b border-gray180 py-4">
      <div className="h-32 animate-pulse rounded-xl bg-gray10" />
    </div>
    <div className="py-4">
      <div className="h-24 animate-pulse rounded-xl bg-gray10" />
    </div>
  </div>
);

// Same layout as order-placing's post-checkout detail view (STEP 32) —
// header, OrderDetailSections, RetryPayment, CancelOrder — so an order
// opened from "Buyurtmalarim" looks identical to one just placed. Only
// difference: no post-checkout "Yopish"/Telegram close action here.
const MyOrderDetail = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopid();
  const {
    orderId,
    detail,
    isLoading,
    isError,
    cancelOrder,
    isCancelling,
    cancelError,
    proceedToPayment,
    isPaying,
  } = useMyOrderDetail();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="fixed inset-x-0 top-0 z-10 border-b border-gray180 bg-white">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-3">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.back()}
            className="shrink-0 text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-base font-medium text-black">
              {t("orders_title_number", { id: orderId })}
            </h1>
            {detail && (
              <p className="mt-0.5 flex items-center justify-center gap-2 text-xs font-medium text-gray220">
                <Clock size={11} />
                {formatOrderDate(detail.status.datetime)}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() =>
              router.push(`${ROUTER.CHAT}${shopid ? `?shop_id=${shopid}` : ""}`)
            }
            aria-label={t("orders_support")}
            className="shrink-0 text-black"
          >
            <Headphones size={20} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <MyOrderDetailSkeleton />
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

export default MyOrderDetail;
