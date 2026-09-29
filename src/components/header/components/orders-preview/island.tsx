"use client";

import { ChevronRight } from "lucide-react";

import type { MyOrderListItem, OrderStatusValue } from "@/types/order";
import { getImageSrc, handleImageFallback } from "@/utils/image";

import { useGoToOrders } from "./orders-preview";

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

const LiveDot = () => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
  </span>
);

// 14 — "dynamic island" bar at the bottom centre, in the project palette:
// white pill + gray border, primary live dot and "Kuzatish" button. It
// speaks about the latest order (its dish photo, status, number); the
// "+N" chip and the second line count the OTHER active orders — never
// the dishes, which read as the same number and confused the two.
// Not rendered anywhere for now — kept for later use (exported only so it
// isn't flagged as unused).
export const Island = ({
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
