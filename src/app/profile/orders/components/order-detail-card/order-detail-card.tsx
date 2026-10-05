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

import StatusBadge from "@/components/order-status-badge";

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
      <p className="shrink-0 text-xs font-medium text-black">
        {formatPrice(item.amount)} {t("sum")}
      </p>
    </li>
  );
};

type OrderDetailCardProps = {
  order: MyOrderListItem;
  customerName?: string;
  customerPhone?: string;
  expanded: boolean;
  onToggleExpand: () => void;
};

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
  const locationLabel = isPickup
    ? t("orders_card_shop_address")
    : t("delivery_address");
  const locationValue = isPickup ? order.branch : order.address;
  const isCancellable = order.status.status === "NEW";

  const { cancelOrder, isCancelling } = useCancelOrder(order.id, {
    onSuccess: () => setConfirmOpen(false),
  });

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray180 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-black">ID-{order.id}</p>
        <StatusBadge status={order.status.status} />
      </div>

      {locationValue && (
        <div>
          <p className="info-label">{locationLabel}</p>
          <p className="info-value">{locationValue}</p>
        </div>
      )}

      <div>
        <p className="info-label">{t("orders_card_created_at")}</p>
        <p className="info-value">
          {formatOrderDate(order.created_at).replace(" ", "; ")}
        </p>
      </div>

      {customerName && (
        <div>
          <p className="info-label">{t("orders_card_full_name")}</p>
          <p className="info-value">{customerName}</p>
        </div>
      )}

      {customerPhone && (
        <div>
          <p className="info-label">{t("orders_card_phone_number")}</p>
          <p className="info-value">{customerPhone}</p>
        </div>
      )}

      <div className="border-t border-gray180/60 pt-3">
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
            {order.items.map((item, index) => (
              <OrderItemRow key={`${item.id}-${index}`} item={item} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray180/60 pt-3">
        <span className="info-label">{t("orders_card_total_price")}</span>
        <span className="text-sm font-medium text-black">
          {formatPrice(order.amount)} {t("sum")}
        </span>
      </div>

      {isCancellable && (
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={() => setConfirmOpen(true)}
          className="h-11 w-full rounded-xl bg-red/10 text-sm font-medium text-red"
        >
          {t("orders_cancel_button")}
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="max-w-[340px] rounded-3xl bg-white p-5"
          showCloseButton={false}
        >
          <DialogTitle className="text-center text-xl font-medium text-black">
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
