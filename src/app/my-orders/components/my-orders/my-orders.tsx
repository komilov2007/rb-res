"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import MobileFooter from "@/components/mobile-footer";

import Button from "@/components/ui/button";

import { useMyOrders } from "@/hooks/useMyOrders";
import OrderCard from "../order-card";

const TABS = [
  { key: true, label: "orders_tabs_active" },
  { key: false, label: "orders_tabs_all" },
] as const;

// Matches this project's established skeleton style (animate-pulse +
// bg-gray10 blocks) from payment-method/branches' own skeletons.
const OrderCardSkeleton = () => (
  <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
    <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-gray10" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-24 animate-pulse rounded-full bg-gray10" />
      <div className="h-3 w-32 animate-pulse rounded-full bg-gray10" />
      <div className="h-3 w-full animate-pulse rounded-full bg-gray10" />
    </div>
  </div>
);

// Same structural pattern as cart's EmptyCart (icon-in-circle + heading +
// hint), but hardcoded Uzbek strings per this project's established
// order-feature convention rather than cart's i18n one.
const EmptyOrders = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <PackageSearch size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-medium text-black">
        {t("orders_empty_title")}
      </h3>
      <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray220">
        {t("orders_empty_hint")}
      </p>
    </div>
  );
};

const MyOrders = () => {
  const t = useTranslations();
  const router = useRouter();
  const {
    orders,
    isActive,
    setIsActive,
    isLoading,
    isFetchingNextPage,
    bottomRef,
  } = useMyOrders();

  return (
    <div className="flex min-h-screen flex-col bg-gray10 pb-[74px] lg:pb-0">
      <div className="fixed inset-x-0 top-0 z-10 rounded-b-2xl border-b border-gray180 bg-white">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.back()}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="text-base font-medium text-black">
            {t("order")}
          </h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 pt-[calc(60px+env(safe-area-inset-top))] pb-6">
        <div className="flex gap-2 px-4 pt-3">
          {TABS.map((tab) => (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setIsActive(tab.key)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive === tab.key
                  ? "bg-primary text-white"
                  : "bg-white text-gray220"
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 px-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {isFetchingNextPage &&
                Array.from({ length: 2 }).map((_, index) => (
                  <OrderCardSkeleton key={`next-${index}`} />
                ))}
            </>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>
      {/* Bottom nav stays visible here too (these pages don't use PageLayout). */}
      <MobileFooter />
    </div>
  );
};

export default MyOrders;
