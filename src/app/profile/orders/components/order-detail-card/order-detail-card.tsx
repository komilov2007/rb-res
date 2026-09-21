"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import type { MyOrderListItem, MyOrderListItemProduct } from "@/types/order";
import { formatOrderDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";
import { handleImageFallback, IMAGE_PLACEHOLDER_SRC } from "@/utils/image";

import StatusBadge from "@/app/my-orders/components/status-badge";

// Only used within this card's own product list — not shared elsewhere, so
// it stays a plain local component rather than its own file.
const OrderItemRow = ({ item }: { item: MyOrderListItemProduct }) => {
  const t = useTranslations();

  return (
    <li className="flex items-center gap-2">
      <img
        src={item.photo || IMAGE_PLACEHOLDER_SRC}
        onError={handleImageFallback}
        alt=""
        className="h-8 w-8 shrink-0 rounded-lg bg-gray10 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-normal text-black">{item.name}</p>
        <p className="text-[11px] font-normal text-gray220">
          {item.count} {item.unit}
        </p>
      </div>
      <p className="shrink-0 text-xs font-bold text-black">
        {formatPrice(item.amount)} {t("sum")}
      </p>
    </li>
  );
};

// Softer than plain black/bold so the label (text-gray220) vs value contrast
// reads as "muted label, legible-but-gentle value" rather than "muted label,
// heavy black value" — still visibly darker/heavier than the label, just not
// stark. No existing gray token in this project's palette sits between
// gray220 and black, so this is a one-off value per the exact tone/weight
// asked for here.
const VALUE_CLASS_NAME = "text-[13px] font-medium text-[#3D3D3D]";

type OrderDetailCardProps = {
  order: MyOrderListItem;
  // The list endpoint has no per-order customer name/phone field — these
  // come from the logged-in account instead (accurate here since this is
  // always "my own" orders), not fabricated per-order data.
  customerName?: string;
  customerPhone?: string;
  // Controlled by the parent (keyed by order.id there) rather than owned
  // locally here, so there's no ambiguity about whether this card's own
  // expand state could ever be shared with another card's.
  expanded: boolean;
  onToggleExpand: () => void;
};

// Desktop's "Buyurtmalarim" shows this full card directly in the list
// instead of linking out to a separate detail page — see orders.tsx.
const OrderDetailCard = ({
  order,
  customerName,
  customerPhone,
  expanded,
  onToggleExpand,
}: OrderDetailCardProps) => {
  const t = useTranslations();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPickup =
    order.service_type === "PICKUP" || order.service_type === "BTS_PICKUP";
  const locationLabel = isPickup ? t("orders_card_shop_address") : t("delivery_address");
  const locationValue = isPickup ? order.branch : order.address;
  // Matches the confirmed rule on the order detail page (my-order-summary.tsx:
  // isCancellable = status === "NEW") — that's the verified backend
  // constraint, not every "not yet delivered" status.
  const isCancellable = order.status.status === "NEW";

  const { cancelOrder, isCancelling } = useCancelOrder(order.id, {
    onSuccess: () => setConfirmOpen(false),
  });

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray180 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-black">ID-{order.id}</p>
        <StatusBadge status={order.status.status} />
      </div>

      {locationValue && (
        <div>
          <p className="text-xs font-normal text-gray220">{locationLabel}</p>
          <p className={`mt-0.5 ${VALUE_CLASS_NAME}`}>{locationValue}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-normal text-gray220">
          {t("orders_card_created_at")}
        </p>
        <p className={`mt-0.5 ${VALUE_CLASS_NAME}`}>
          {formatOrderDate(order.created_at).replace(" ", "; ")}
        </p>
      </div>

      {customerName && (
        <div>
          <p className="text-xs font-normal text-gray220">{t("orders_card_full_name")}</p>
          <p className={`mt-0.5 ${VALUE_CLASS_NAME}`}>{customerName}</p>
        </div>
      )}

      {customerPhone && (
        <div>
          <p className="text-xs font-normal text-gray220">{t("orders_card_phone_number")}</p>
          <p className={`mt-0.5 ${VALUE_CLASS_NAME}`}>{customerPhone}</p>
        </div>
      )}

      <div className="border-t border-gray180/60 pt-3">
        {/* No product shows until this is clicked — including the first
            one — then all of them appear together. */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex w-full items-center justify-between text-xs font-medium text-black"
        >
          {t("cart_product_count", { count: order.items.length })}
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <ul className="mt-2.75 flex flex-col gap-2.75">
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray180/60 pt-3">
        <span className="text-xs font-normal text-gray220">{t("orders_card_total_price")}</span>
        <span className={VALUE_CLASS_NAME}>
          {formatPrice(order.amount)} {t("sum")}
        </span>
      </div>

      {isCancellable && (
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={() => setConfirmOpen(true)}
          className="h-11 w-full rounded-xl bg-red/10 text-sm font-bold text-red"
        >
          {t("orders_cancel_button")}
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="max-w-[340px] rounded-3xl bg-white p-5"
          showCloseButton={false}
        >
          <DialogTitle className="text-center text-xl font-bold text-black">
            {t("orders_cancel_confirm_title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-normal text-gray220">
            {t("orders_card_cancel_description", { id: order.id })}
          </DialogDescription>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setConfirmOpen(false)}
              className="rounded-2xl"
            >
              {t("common_cancel")}
            </Button>
            <Button
              type="button"
              variant="plain"
              size="lg"
              disabled={isCancelling}
              onClick={() => cancelOrder()}
              className="rounded-2xl bg-red/10 text-red"
            >
              {t("common_confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailCard;
