"use client";

import { Suspense, useState } from "react";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePage } from "@/app/my-orders/usePage";
import { useAuthStore } from "@/stores/auth";
import { formatPhone, getLocalPhone } from "@/utils/format-number";
import LoginRequired from "../components/login-required";
import ProfilePageShell from "../components/profile-page-shell";
import OrderDetailCard from "./components/order-detail-card";

const TABS = [
  { key: true, label: "orders.tabs.active" },
  { key: false, label: "orders.tabs.all" },
] as const;

// Mirrors OrderDetailCard's own section-by-section layout (id+badge,
// address, date, name, phone, item row, price row, button) rather than the
// old simple thumbnail+lines shape, so the loading state doesn't visibly
// jump in structure once real cards replace it.
const OrderCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-gray180 bg-white p-4">
    <div className="flex items-center justify-between gap-2">
      <div className="h-4 w-20 animate-pulse rounded-full bg-gray10" />
      <div className="h-5 w-16 animate-pulse rounded-full bg-gray10" />
    </div>
    <div>
      <div className="h-3 w-24 animate-pulse rounded-full bg-gray10" />
      <div className="mt-1.5 h-3.5 w-full animate-pulse rounded-full bg-gray10" />
    </div>
    <div>
      <div className="h-3 w-32 animate-pulse rounded-full bg-gray10" />
      <div className="mt-1.5 h-3.5 w-28 animate-pulse rounded-full bg-gray10" />
    </div>
    <div>
      <div className="h-3 w-24 animate-pulse rounded-full bg-gray10" />
      <div className="mt-1.5 h-3.5 w-32 animate-pulse rounded-full bg-gray10" />
    </div>
    <div>
      <div className="h-3 w-24 animate-pulse rounded-full bg-gray10" />
      <div className="mt-1.5 h-3.5 w-28 animate-pulse rounded-full bg-gray10" />
    </div>
    <div className="border-t border-gray180/60 pt-3">
      <div className="h-4 w-28 animate-pulse rounded-full bg-gray10" />
    </div>
    <div className="flex items-center justify-between border-t border-gray180/60 pt-3">
      <div className="h-3 w-20 animate-pulse rounded-full bg-gray10" />
      <div className="h-4 w-24 animate-pulse rounded-full bg-gray10" />
    </div>
    <div className="h-11 w-full animate-pulse rounded-xl bg-gray10" />
  </div>
);

const EmptyOrders = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <PackageSearch size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-black">
        {t("orders.empty_title")}
      </h3>
      <p className="mt-2 max-w-70 text-sm leading-6 text-gray220">
        {t("orders.empty_hint")}
      </p>
    </div>
  );
};

// Desktop-only "Buyurtmalarim" destination — reuses /my-orders' own data
// hook (mobile's page keeps working exactly as before; this is a second
// consumer of the same underlying feature, not a replacement). Shows the
// full order card inline (no separate detail page on desktop) via
// OrderDetailCard. The tabs/list here are /my-orders' own body content,
// just without its fixed mobile header — ProfilePageShell provides the
// back+title bar here.
const OrdersContent = () => {
  const t = useTranslations();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const auth = useAuthStore((state) => state.auth);
  const { orders, isActive, setIsActive, isLoading, isFetchingNextPage, bottomRef } =
    usePage();
  // Keyed by order id so each card's expand/collapse is independent —
  // owned here rather than inside OrderDetailCard so there's no ambiguity
  // about whether that state could ever be shared between cards.
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  if (!hasAccess) {
    return <LoginRequired message={t("orders.login_required")} />;
  }

  const customerPhone = auth?.phone
    ? `+998 ${formatPhone(getLocalPhone(auth.phone))}`
    : undefined;
  const toggleExpanded = (orderId: number) =>
    setExpandedIds((previous) => ({
      ...previous,
      [orderId]: !previous[orderId],
    }));

  // A CSS grid still ties both columns to a shared row height per pair, so
  // expanding a right-column card was leaving a gap under its (unchanged)
  // left-column neighbor once the next row started lower. Splitting into two
  // genuinely independent flex columns by alternating index removes that
  // coupling entirely — each column's own cards determine its own height,
  // with newest-first order preserved down each column (0,2,4… left,
  // 1,3,5… right) rather than reordered the way CSS multi-column would.
  const leftOrders = orders.filter((_, index) => index % 2 === 0);
  const rightOrders = orders.filter((_, index) => index % 2 === 1);
  const renderCard = (order: (typeof orders)[number]) => (
    <OrderDetailCard
      key={order.id}
      order={order}
      customerName={auth?.firstname || undefined}
      customerPhone={customerPhone}
      expanded={Boolean(expandedIds[order.id])}
      onToggleExpand={() => toggleExpanded(order.id)}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={String(tab.key)}
            type="button"
            onClick={() => setIsActive(tab.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold ${
              isActive === tab.key
                ? "bg-primary text-white"
                : "bg-gray10 text-gray220"
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        // min-w-0 on each column: flex-1's automatic minimum width is its
        // content's own min-content size, not 0 — without this, a long
        // product name (revealed by "Yana N ta mahsulot") could force that
        // column past its fair 50% share instead of actually truncating,
        // widening it relative to the other column.
        <div className="flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {leftOrders.map(renderCard)}
            {isFetchingNextPage && <OrderCardSkeleton />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {rightOrders.map(renderCard)}
            {isFetchingNextPage && <OrderCardSkeleton />}
          </div>
        </div>
      )}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

const ProfileOrders = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("order")}>
      {/* useSearchParams (shop_id) needs a Suspense boundary. */}
      <Suspense>
        <OrdersContent />
      </Suspense>
    </ProfilePageShell>
  );
};

export default ProfileOrders;
