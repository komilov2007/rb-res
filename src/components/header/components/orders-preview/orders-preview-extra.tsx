"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { IconClipboardListFilled } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { getMyOrders } from "@/apis/order";
import StatusBadge from "@/components/order-status-badge";
import StatusTimeline from "@/components/status-timeline";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import type { MyOrderListItem, OrderStatusValue } from "@/types/order";
import { formatOrderDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";
import { getProfileOrdersUrl } from "@/utils/orders";
import { getImageSrc, handleImageFallback } from "@/utils/image";

import { useGoToOrders } from "./orders-preview";
import { useOrdersPreview } from "./store";

// TEMPORARY — variants 14, 15, 19 of the desktop "Buyurtmalarim" preview.
// Everything is `hidden lg:*`, mobile is untouched.

const LIST_LIMIT = 5;

// Same is_active list useActiveOrdersCount polls, but with rows — the
// trackers need the latest order's status and photos.
const useActiveOrders = () => {
  const customerId = useAuthStore((state) => state.auth?.customer);

  const { data } = useQuery({
    enabled: Boolean(customerId),
    queryKey: [REACT_QUERY_KEYS.ACTIVE_ORDERS_COUNT, customerId, LIST_LIMIT],
    queryFn: () =>
      getMyOrders(customerId as number, {
        limit: LIST_LIMIT,
        offset: 0,
        is_active: true,
      }),
    refetchInterval: 30000,
  });

  return {
    count: data?.data.count ?? 0,
    orders: data?.data.results ?? [],
  };
};

// The orders pages themselves (desktop profile list, mobile my-orders).
const useIsOnOrdersPage = () => {
  const pathname = usePathname();

  return (
    pathname.startsWith(ROUTER.PROFILE_ORDERS) ||
    pathname.startsWith(ROUTER.MY_ORDERS)
  );
};

const STEP_BY_STATUS: Partial<Record<OrderStatusValue, number>> = {
  NEW: 0,
  PROGRESS: 1,
  READY: 2,
  ON_THE_WAY: 2,
  DELIVERED: 3,
  COMPLETED: 3,
};

const getSteps = (order: MyOrderListItem) => [
  "Qabul qilindi",
  "Tayyorlanmoqda",
  order.service_type === "PICKUP" ? "Tayyor" : "Yo'lda",
  order.service_type === "PICKUP" ? "Olib ketildi" : "Yetkazildi",
];

const getStep = (order: MyOrderListItem) =>
  STEP_BY_STATUS[order.status.status] ?? 0;

const LiveDot = ({ light = false }: { light?: boolean }) => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span
      className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
        light ? "bg-white/70" : "bg-primary/60"
      }`}
    />
    <span
      className={`relative inline-flex h-2 w-2 rounded-full ${
        light ? "bg-white" : "bg-primary"
      }`}
    />
  </span>
);

// 14 — "dynamic island" bar at the bottom centre, in the project palette:
// white pill + gray border, primary live dot and "Kuzatish" button. It
// speaks about the latest order (its dish photo, status, number); the
// "+N" chip and the second line count the OTHER active orders — never
// the dishes, which read as the same number and confused the two.
const Island = ({
  count,
  order,
}: {
  count: number;
  order: MyOrderListItem;
}) => {
  const goToOrders = useGoToOrders();
  const steps = getSteps(order);
  const others = count - 1;

  return (
    <button
      type="button"
      onClick={goToOrders}
      className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-gray180 bg-white py-2 pl-2 pr-2 text-black shadow-[0_12px_32px_rgba(17,24,39,0.12)] transition-transform hover:-translate-y-0.5 lg:flex"
    >
      <span className="relative shrink-0">
        <img
          src={getImageSrc(order.items[0]?.photo)}
          onError={handleImageFallback}
          alt=""
          className="h-10 w-10 rounded-full bg-gray10 object-cover"
        />
        {others > 0 && (
          <span className="absolute -bottom-1 -right-2 rounded-full bg-primary px-1.5 text-[11px] leading-[18px] text-white ring-2 ring-white">
            +{others}
          </span>
        )}
      </span>
      <span className="ml-1 flex flex-col items-start">
        <span className="flex items-center gap-2 text-sm">
          <LiveDot />
          {steps[getStep(order)]}
          <span className="text-gray220">· #{order.id}</span>
        </span>
        <span className="text-xs text-gray220">
          {others > 0 ? `Yana ${others} ta faol buyurtma` : "Faol buyurtmangiz"}
        </span>
      </span>
      <span className="ml-3 flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-white">
        Kuzatish <ChevronRight size={15} />
      </span>
    </button>
  );
};

const OrderItemRow = ({ item }: { item: MyOrderListItem["items"][number] }) => {
  const t = useTranslations();

  return (
    <li className="flex items-center gap-2.5 text-sm">
      <img
        src={getImageSrc(item.photo)}
        onError={handleImageFallback}
        alt=""
        className="h-7 w-7 shrink-0 rounded-md bg-gray10 object-cover"
      />
      <span className="min-w-0 flex-1 truncate text-black">{item.name}</span>
      <span className="shrink-0 text-gray220">× {item.count}</span>
      {/* Line amount — confirmed live: the items' amounts sum to the
          order's amount. */}
      <span className="w-24 shrink-0 text-right text-black">
        {formatPrice(item.amount)} {t("sum")}
      </span>
    </li>
  );
};

// One order in the edge-tab drawer, laid out like a delivery-app order
// row: the first dish's photo (with a "+N" chip) is the visual anchor,
// then two aligned lines — number / total on top, contents · time /
// status below. The photo + number open the order; the contents line
// unfolds the products and the status unfolds the shared 4-step
// StatusTimeline (both animated via grid-rows).
const EdgeOrderCard = ({
  order,
  index,
  onOpen,
}: {
  order: MyOrderListItem;
  index: number;
  onOpen: (orderId: number) => void;
}) => {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [first] = order.items;
  const extra = order.items.length - 1;
  const isSingle = order.items.length === 1;

  const fold = (open: boolean) =>
    `grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
    }`;

  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      // Fade + slight zoom-in: a horizontal/vertical slide would push the
      // rows past the list for a moment and flash its scrollbar.
      className="py-4 duration-500 animate-in fade-in zoom-in-95 fill-mode-both"
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onOpen(order.id)}
          aria-label={`Buyurtma #${order.id}`}
          className="group/photo relative h-12 w-12 shrink-0"
        >
          <img
            src={getImageSrc(first?.photo)}
            onError={handleImageFallback}
            alt=""
            className="h-12 w-12 rounded-xl bg-gray10 object-cover transition-transform duration-300 group-hover/photo:scale-105"
          />
          {extra > 0 && (
            <span className="absolute -bottom-1 -right-1 rounded-full bg-black px-1.5 text-[11px] leading-[18px] text-white ring-2 ring-white">
              +{extra}
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpen(order.id)}
              className="info-label truncate text-left transition-colors hover:text-primary"
            >
              Buyurtma #{order.id}
            </button>
            <span className="shrink-0 text-sm text-black">
              {formatPrice(order.amount)} {t("sum")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1 text-xs text-gray220">
              {isSingle ? (
                <span className="truncate">
                  {first?.name} × {first?.count}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  className="flex shrink-0 items-center gap-0.5"
                >
                  {order.items.length} ta mahsulot
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              )}
              <span className="shrink-0">
                · {formatOrderDate(order.created_at)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setStatusOpen((value) => !value)}
              aria-expanded={statusOpen}
              className="shrink-0 rounded-full transition-transform active:scale-95"
            >
              <StatusBadge
                status={order.status.status}
                showDot
                endIcon={
                  <ChevronRight
                    size={12}
                    strokeWidth={2.5}
                    className={`-mr-1 transition-transform duration-300 ${statusOpen ? "rotate-90" : ""}`}
                  />
                }
              />
            </button>
          </div>
        </div>
      </div>

      {!isSingle && (
        <div className={fold(expanded)}>
          <ul className="flex min-h-0 flex-col gap-2 overflow-hidden pl-15">
            <span className="h-1.5 shrink-0" />
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </ul>
        </div>
      )}

      <div className={fold(statusOpen)}>
        <div className="min-h-0 overflow-hidden">
          <div className="mt-3 rounded-xl bg-gray10 px-3 pb-3 pt-3.5">
            <StatusTimeline status={order.status.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

// 15 — vertical tab on the right edge that opens a side panel. z-[55]: above
// the home sections and the fixed categories row (z-50), hidden while open
// and while any other modal/drawer (cart, product...) locks the page scroll.
const EdgeTab = ({
  count,
  orders,
}: {
  count: number;
  orders: MyOrderListItem[];
}) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const [open, setOpen] = useState(false);

  // An order card opens that order expanded in the profile list.
  const goToOrder = (orderId?: number) => {
    setOpen(false);
    router.push(getProfileOrdersUrl(shopid, orderId));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-[62%] z-[55] -translate-y-1/2 flex-col items-center gap-2.5 rounded-l-2xl bg-primary px-2.5 py-4 text-white shadow-[-4px_0_16px_rgba(17,24,39,0.15)] transition-[padding] hover:pr-4 [body[data-scroll-locked]_&]:hidden! ${open ? "hidden" : "hidden lg:flex"}`}
      >
        <IconClipboardListFilled size={20} />
        <span className="rotate-180 text-sm [writing-mode:vertical-rl]">
          {t("order")}
        </span>
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] text-primary">
          {count}
        </span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          aria-describedby={undefined}
          className="w-[420px] max-w-[420px] gap-0 bg-white p-0"
        >
          <div className="flex items-center gap-3 border-b border-gray180 bg-white px-5 py-4 pr-14">
            <SheetTitle className="info-label flex items-center gap-2">
              Faol buyurtmalar
            </SheetTitle>
          </div>

          <div className="scroll-panel flex flex-1 flex-col divide-y divide-gray180 overflow-y-auto overflow-x-hidden px-5">
            {orders.map((order, index) => (
              <EdgeOrderCard
                key={order.id}
                order={order}
                index={index}
                onOpen={goToOrder}
              />
            ))}
          </div>

          <div className="border-t border-gray180 bg-white p-4">
            <button
              type="button"
              onClick={() => goToOrder()}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary py-3 text-sm text-white transition-opacity hover:opacity-90"
            >
              Barcha buyurtmalar <ChevronRight size={15} />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// Rendered once in the header fragment.
export const OrdersFloatingExtras = () => {
  const preview = useOrdersPreview();
  const { count, orders } = useActiveOrders();
  const isOnOrdersPage = useIsOnOrdersPage();
  const latest = orders[0];

  // Already looking at the orders — no need to point at them.
  if (isOnOrdersPage) return null;

  if (!latest) return null;

  return (
    <>
      {preview.showIsland && <Island count={count} order={latest} />}
      {preview.showEdgeTab && <EdgeTab count={count} orders={orders} />}
    </>
  );
};

// 19 — coloured status bar above the topbar.
export const OrdersTopStrip = () => {
  const preview = useOrdersPreview();
  const goToOrders = useGoToOrders();
  const { count, orders } = useActiveOrders();
  const isOnOrdersPage = useIsOnOrdersPage();
  const latest = orders[0];

  if (isOnOrdersPage) return null;

  if (!preview.showTopStrip || !latest) return null;

  return (
    <button
      type="button"
      onClick={goToOrders}
      className="hidden h-9 w-full items-center justify-center gap-2 bg-primary text-sm text-white lg:flex"
    >
      <LiveDot light />
      Buyurtma #{latest.id}: {getSteps(latest)[getStep(latest)].toLowerCase()}
      {count > 1 ? ` · yana ${count - 1} ta faol` : ""}
      <span className="flex items-center underline underline-offset-2">
        Kuzatish <ChevronRight size={14} />
      </span>
    </button>
  );
};
