"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import StatusBadge from "@/components/order-status-badge";
import StatusTimeline from "@/components/status-timeline";
import type { MyOrderListItem } from "@/types/order";
import { formatOrderDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";
import { getImageSrc, handleImageFallback } from "@/utils/image";

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
export const EdgeOrderCard = ({
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
