"use client";

import { useRouter } from "next/navigation";
import { useShopId } from "@/hooks/useShopId";
import { getProfileOrdersUrl } from "@/utils/orders";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { IconClipboardListFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { MyOrderListItem, OrderStatusValue } from "@/types/order";
import { EdgeOrderCard } from "./edge-order-card";
import { getImageSrc, handleImageFallback } from "@/utils/image";

export const useGoToOrders = () => {
  const router = useRouter();
  const { shopid } = useShopId();

  return () => router.push(getProfileOrdersUrl(shopid));
};

export const EdgeTab = ({
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

  const goToOrder = (orderId?: number) => {
    setOpen(false);
    router.push(getProfileOrdersUrl(shopid, orderId));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-[45%] z-[55] -translate-y-1/2 flex-col items-center gap-2.5 rounded-l-2xl bg-primary px-2.5 py-4 text-white shadow-[-4px_0_16px_rgba(17,24,39,0.15)] transition-[padding] hover:pr-4 [body[data-scroll-locked]_&]:hidden! ${open ? "hidden" : "hidden lg:flex"}`}
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
