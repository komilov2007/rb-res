"use client";

import { Suspense, useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMyOrders } from "@/hooks/useMyOrders";
import { useShopId } from "@/hooks/useShopId";
import { ROUTER } from "@/constants/router";
import { useAuthStore } from "@/stores/auth";
import { formatPhone, getLocalPhone } from "@/utils/format-number";
import { getOrderDetailUrl } from "@/utils/orders";
import LoginRequired from "../components/login-required";
import ProfilePageShell from "../components/profile-page-shell";
import OrderDetailCard from "./components/order-detail-card";

const TABS = [
  { key: true, label: "orders_tabs_active" },
  { key: false, label: "orders_tabs_all" },
] as const;

// Mirrors OrderDetailCard's own section-by-section layout (id+badge,
// address, date, name, phone, item row, price row, button) rather than the
// old simple thumbnail+lines shape, so the loading state doesn't visibly
// jump in structure once real cards replace it. Each bar sits in a box of
// the real text's line height, and the card keeps the real card's padding
// and border width (border transparent — no borders on skeletons).
const SkeletonField = ({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string;
  valueWidth: string;
}) => (
  <div>
    <div className="flex h-4 items-center">
      <div className={`skeleton h-3 rounded-full ${labelWidth}`} />
    </div>
    <div className="mt-0.5 flex h-5 items-center">
      <div className={`skeleton h-3.5 rounded-full ${valueWidth}`} />
    </div>
  </div>
);

const OrderCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-white p-4">
    <div className="flex h-5 items-center justify-between gap-2">
      <div className="skeleton h-4 w-20 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
    <SkeletonField labelWidth="w-24" valueWidth="w-full" />
    <SkeletonField labelWidth="w-32" valueWidth="w-28" />
    <SkeletonField labelWidth="w-24" valueWidth="w-32" />
    <SkeletonField labelWidth="w-24" valueWidth="w-28" />
    <div className="flex h-4 items-center border-t border-transparent pt-3 box-content">
      <div className="skeleton h-3.5 w-28 rounded-full" />
    </div>
    <div className="flex h-5 items-center justify-between border-t border-transparent pt-3 box-content">
      <div className="skeleton h-3 w-20 rounded-full" />
      <div className="skeleton h-3.5 w-24 rounded-full" />
    </div>
    <div className="skeleton h-11 w-full rounded-xl" />
  </div>
);

const EmptyOrders = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <PackageSearch size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-medium text-black">
        {t("orders_empty_title")}
      </h3>
      <p className="mt-2 max-w-70 text-sm leading-6 text-gray220">
        {t("orders_empty_hint")}
      </p>
    </div>
  );
};

// Desktop "Buyurtmalarim" (mobile is redirected — see MobileOrdersRedirect
// below). Each order is a full card shown inline — there is no
// separate order detail page. ?order=<id> (set after checkout, a paid order
// or a chat link) opens that order's card expanded.
const OrdersContent = () => {
  const t = useTranslations();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const auth = useAuthStore((state) => state.auth);
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const {
    orders,
    isActive,
    setIsActive,
    isLoading,
    isFetchingNextPage,
    bottomRef,
  } = useMyOrders();
  const focusedOrderId = Number(searchParams.get("order"));
  // Keyed by order id so each card's expand/collapse is independent —
  // owned here rather than inside OrderDetailCard so there's no ambiguity
  // about whether that state could ever be shared between cards.
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>(() =>
    focusedOrderId ? { [focusedOrderId]: true } : {},
  );

  if (!hasAccess) {
    return <LoginRequired message={t("orders_login_required")} />;
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
  // Mobile: one column.
  const columns = isDesktop
    ? [
        orders.filter((_, index) => index % 2 === 0),
        orders.filter((_, index) => index % 2 === 1),
      ]
    : [orders];
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
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={String(tab.key)}
            type="button"
            onClick={() => setIsActive(tab.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium ${
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
        <div className="flex gap-2">
          {columns.map((_, column) => (
            <div key={column} className="flex min-w-0 flex-1 flex-col gap-2">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        // min-w-0 on each column: flex-1's automatic minimum width is its
        // content's own min-content size, not 0 — without this, a long
        // product name (revealed by "Yana N ta mahsulot") could force that
        // column past its fair 50% share instead of actually truncating,
        // widening it relative to the other column.
        <div className="flex gap-2">
          {columns.map((columnOrders, column) => (
            <div key={column} className="flex min-w-0 flex-1 flex-col gap-2">
              {columnOrders.map(renderCard)}
              {isFetchingNextPage && <OrderCardSkeleton />}
            </div>
          ))}
        </div>
      )}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

const DESKTOP_QUERY = "(min-width: 1024px)";

// This page is the desktop "Buyurtmalarim" only. Mobile has its own order
// pages, so a phone that lands here (an old link, ?order=<id> from a
// desktop-shared URL) is sent to /my-orders or that order's detail page.
const MobileOrdersRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shopid } = useShopId();
  const orderId = searchParams.get("order");

  useEffect(() => {
    // Checked directly: useMediaQuery reports false during hydration, which
    // would send desktop visitors away too.
    if (window.matchMedia(DESKTOP_QUERY).matches) return;

    router.replace(
      orderId
        ? getOrderDetailUrl(false, shopid, orderId)
        : `${ROUTER.MY_ORDERS}${shopid ? `?shop_id=${shopid}` : ""}`,
    );
  }, [orderId, router, shopid]);

  return null;
};

const ProfileOrders = () => {
  const t = useTranslations();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // Never render the desktop list on a phone — not even for a frame.
  if (!isDesktop) {
    return (
      <Suspense>
        <MobileOrdersRedirect />
      </Suspense>
    );
  }

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
