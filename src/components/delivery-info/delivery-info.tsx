"use client";

import { IconAlertCircleFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { useGeneral } from "@/hooks/useGeneral";
import { getDeliveryInfo } from "@/utils/delivery-rules";
import { formatPrice } from "@/utils/format-price";

// Human-readable courier pricing configured by the shop
// (FREE / FIXED / FLEXABLE per-km / CUSTOM text).
export const useDeliveryInfoLabel = () => {
  const t = useTranslations();
  const { data: general } = useGeneral();
  const info = getDeliveryInfo(general?.data);
  const currency = t("sum");

  if (!info) return null;

  switch (info.kind) {
    case "free":
      return t("delivery_free");
    case "fixed":
      return `${formatPrice(info.price)} ${currency}`;
    case "flexible":
      if (info.initialKm && info.initialPrice !== null && info.kmPrice) {
        return t("delivery_flexible", {
          km: info.initialKm,
          initial: formatPrice(info.initialPrice),
          perKm: formatPrice(info.kmPrice),
          currency,
        });
      }
      return info.kmPrice
        ? t("delivery_flexible_short", {
            perKm: formatPrice(info.kmPrice),
            currency,
          })
        : null;
    case "custom":
      return info.text ?? t("delivery_custom_default");
  }
};

type MinOrderNoticeProps = {
  minPrice: number;
  total: number;
  className?: string;
};

// Shown while the cart total is below the selected service's minimum.
export const MinOrderNotice = ({
  minPrice,
  total,
  className = "",
}: MinOrderNoticeProps) => {
  const t = useTranslations();
  const currency = t("sum");

  return (
    <div
      className={`flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-amber-700 ${className}`}
    >
      <IconAlertCircleFilled size={18} className="mt-px shrink-0" />
      <p className="text-[13px] leading-5">
        {t("min_order_amount", { amount: formatPrice(minPrice), currency })}
        {" · "}
        <span className="font-medium">
          {t("min_order_add_more", {
            amount: formatPrice(Math.max(0, minPrice - total)),
            currency,
          })}
        </span>
      </p>
    </div>
  );
};
