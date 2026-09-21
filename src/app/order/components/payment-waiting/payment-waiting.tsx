"use client";

import { createElement } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { openPaymentLink } from "@/utils/telegram";
import type { PaymentTypeProps } from "@/types/order";

import {
  PAYMENT_CARD_CONFIG,
  getPaymentIcon,
} from "../payment-method/constants";

type PaymentWaitingProps = {
  paymentUrl: string | null;
  paymentType: string | null;
};

const PaymentWaiting = ({
  paymentUrl,
  paymentType,
}: PaymentWaitingProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();

  const goHome = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const config = paymentType
    ? PAYMENT_CARD_CONFIG[paymentType as PaymentTypeProps]
    : undefined;
  const paymentLabel = config?.label ?? paymentType;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray10 px-4 text-center">
      <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full border border-gray180 bg-gray180/70 text-gray220">
        <Clock size={36} strokeWidth={1.8} />
      </span>

      <div>
        <h1 className="text-lg font-extrabold text-black">
          {t("order_page_waiting_title")}
        </h1>
        <p className="mt-1 text-sm text-gray220">
          {paymentLabel
            ? t("order_page_waiting_hint_with_type", { payment: paymentLabel })
            : t("order_page_waiting_hint")}
        </p>
      </div>

      {paymentType && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray220">
          <span>{t("order_page_waiting_method")}</span>
          <span className="flex h-8 shrink-0 items-center justify-center overflow-hidden [&_svg]:h-auto [&_svg]:max-h-8 [&_svg]:w-auto [&_svg]:max-w-24">
            {createElement(getPaymentIcon(paymentType as PaymentTypeProps))}
          </span>
        </div>
      )}

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
        >
          {t("order_page_waiting_check")}
        </Button>

        {paymentUrl && (
          <Button
            type="button"
            variant="outline"
            size="primaryWide"
            onClick={() => openPaymentLink(paymentUrl)}
          >
            {t("order_page_waiting_go_to_payment")}
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="plain"
        size="none"
        onClick={goHome}
        className="gap-2 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft size={18} />
        {t("common_back")}
      </Button>
    </div>
  );
};

export default PaymentWaiting;
