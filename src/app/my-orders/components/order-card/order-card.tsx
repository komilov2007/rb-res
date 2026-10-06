"use client";

import { useRouter } from "next/navigation";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useShopId } from "@/hooks/useShopId";
import { ROUTER } from "@/constants/router";
import { formatPrice } from "@/utils/format-price";
import { formatOrderDate } from "@/utils/format-date";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import type { MyOrderListItem } from "@/types/order";
import StatusBadge from "@/components/order-status-badge";

type OrderCardProps = {
  order: MyOrderListItem;
};

const OrderCard = ({ order }: OrderCardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();

  const itemCount = order.items.reduce((sum, item) => sum + item.count, 0);
  const firstPhoto = order.items[0]?.photo;
  const isPickup =
    order.service_type === "PICKUP" || order.service_type === "BTS_PICKUP";
  const locationText = isPickup ? order.branch : order.address;

  const handleOpen = () => {
    router.push(
      `${ROUTER.MY_ORDERS}/${order.id}${shopid ? `?shop_id=${shopid}` : ""}`,
    );
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray10">
        <img
          src={firstPhoto || IMAGE_PLACEHOLDER_SRC}
          alt=""
          onError={handleImageFallback}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-black">№{order.id}</p>
          <StatusBadge status={order.status.status} />
        </div>

        <p className="mt-1 text-xs font-medium text-gray220">
          {formatOrderDate(order.created_at)}
        </p>

        {locationText && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray220">
            <IconMapPinFilled size={13} className="shrink-0 text-gray220" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray220">
            {t("cart_product_count", { count: itemCount })}
          </span>
          <span className="text-sm font-medium text-black">
            {formatPrice(order.amount)} {t("sum")}
          </span>
        </div>
      </div>
    </button>
  );
};

const OrderCardSkeleton = () => (
  <div className="flex items-start gap-3 rounded-2xl bg-white p-4 lg:border lg:border-gray180">
    <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton mt-1 h-4 w-28 rounded-full" />
      <div className="skeleton mt-2 h-4 w-full rounded-full" />
      <div className="mt-2 flex items-center justify-between">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export { OrderCard };

export default OrderCard;
