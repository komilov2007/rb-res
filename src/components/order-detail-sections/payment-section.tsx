"use client";

import { createElement } from "react";
import { IconAlertCircleFilled, IconCircleCheckFilled, IconFileTextFilled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";

import { PAYMENT_CARD_CONFIG, getPaymentIcon } from "@/constants/payment-types";
import type { OrderDetail, PaymentTypeProps } from "@/types/order";
import { formatPrice } from "@/utils/format-price";

import { SERVICE_TYPE_LABELS } from "./constants";
import { InfoRow, SectionLabel } from "./parts";

type PaymentSectionProps = {
  detail: OrderDetail;
  isDelivery: boolean;
};

// Order detail's payment/price breakdown section.
const PaymentSection = ({ detail, isDelivery }: PaymentSectionProps) => {
  const t = useTranslations();
  const amount = Number(detail.amount);
  const deliveryPrice = Number(detail.delivery_price) || 0;
  const paymentType = detail.payment_type as PaymentTypeProps;
  const paymentLabel =
    PAYMENT_CARD_CONFIG[paymentType]?.label ?? detail.payment_type;
  const hasDiscount =
    typeof detail.discount_amount === "number" && detail.discount_amount > 0;
  const promoPercent =
    (detail.promo_code?.type === "PERCENT" ||
      detail.promo_code?.type === "PERCENTAGE") &&
    typeof detail.promo_code.percent === "number"
      ? detail.promo_code.percent
      : null;
  // `item.amount` is treated as the line total (same reading my-orders'
  // own summary uses for the products subtotal).
  const itemsSubtotal = detail.items.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );

  return (
    <section className="py-5">
      <SectionLabel icon={<IconFileTextFilled size={13} />}>
        {t("orders_detail_payment_info")}
      </SectionLabel>
      <div className="mt-3 flex flex-col gap-2.5">
        <InfoRow
          label={t("orders_detail_products_price")}
          value={`${formatPrice(itemsSubtotal)} ${t("sum")}`}
        />
        {(hasDiscount || promoPercent !== null) && (
          <InfoRow
            label={t("discount")}
            valueClassName="text-green-500"
            value={
              <span className="inline-flex items-center gap-2">
                {promoPercent !== null && (
                  <span className="rounded-full bg-red px-2 py-0.5 text-[10px] font-medium leading-none text-white">
                    -{promoPercent}%
                  </span>
                )}
                {hasDiscount
                  ? `-${formatPrice(detail.discount_amount ?? 0)} ${t("sum")}`
                  : null}
              </span>
            }
          />
        )}
        <InfoRow
          label={t("service_type")}
          value={
            SERVICE_TYPE_LABELS[detail.service_type]
              ? t(SERVICE_TYPE_LABELS[detail.service_type])
              : detail.service_type
          }
        />
        {isDelivery && (
          <InfoRow
            label={t("order_page_summary_delivery_price")}
            value={`${formatPrice(deliveryPrice)} ${t("sum")}`}
          />
        )}
        <InfoRow
          label={t("orders_detail_payment_method")}
          value={
            <span className="inline-flex items-center gap-2">
              <span className="flex h-5 shrink-0 items-center overflow-hidden [&_svg]:h-auto [&_svg]:max-h-5 [&_svg]:w-auto [&_svg]:max-w-14">
                {createElement(getPaymentIcon(paymentType))}
              </span>
              {paymentLabel}
            </span>
          }
        />
        <InfoRow
          label={t("orders_detail_payment_status")}
          valueClassName={detail.is_paid ? "text-green-500" : "text-red"}
          value={
            <span className="inline-flex items-center gap-2">
              {detail.is_paid ? (
                <IconCircleCheckFilled size={14} />
              ) : (
                <IconAlertCircleFilled size={14} />
              )}
              {detail.is_paid
                ? t("orders_detail_paid")
                : t("orders_detail_unpaid")}
            </span>
          }
        />
      </div>

      <div className="mt-3 border-t border-gray180 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-black">
            {t("orders_detail_total_payment")}:
          </span>
          <span className="text-xl font-medium text-black">
            {formatPrice(amount)} {t("sum")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
