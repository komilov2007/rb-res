"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { IconClipboardListFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useShopId } from "@/hooks/useShopId";
import type { MyOrderListItem } from "@/types/order";
import { getProfileOrdersUrl } from "@/utils/orders";

import { EdgeOrderCard } from "./edge-order-card";

// 15 — vertical tab on the right edge that opens a side panel. z-[55]: above
// the home sections and the fixed categories row (z-50), hidden while open
// and while any other modal/drawer (cart, product...) locks the page scroll.
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
