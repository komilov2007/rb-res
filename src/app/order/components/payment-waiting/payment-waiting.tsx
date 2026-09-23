"use client";

import { createElement } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IconAlertCircleFilled, IconClockFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { openPaymentLink } from "@/utils/telegram";
import type { PaymentTypeProps } from "@/types/order";

import {
  PAYMENT_CARD_CONFIG,
  getPaymentIcon,
} from "@/constants/payment-types";

// Both states (waiting and timed out) share one shell. Desktop puts the
// content on its own white section with an 8px gray gutter to the header and
// footer, like the catalog and chat pages; mobile stays plain gray. flex-1
// (not min-h-screen) so the footer below stays on screen.
const SHELL_CLASS_NAME =
  "flex flex-1 flex-col items-center justify-center gap-6 bg-gray10 px-4 py-10 text-center lg:my-2 lg:rounded-[30px] lg:bg-white";

type PaymentWaitingProps = {
  paymentUrl: string | null;
  paymentType: string | null;
  // Undefined when the status can't be checked (no externalId).
  onCheck?: () => void;
  isChecking: boolean;
  // No externalId and no answer in time: stop "waiting" and offer ways out.
  isTimedOut: boolean;
  onRetry: () => void;
  orderUrl: string | null;
};

const PaymentWaiting = ({
  paymentUrl,
  paymentType,
  onCheck,
  isChecking,
  isTimedOut,
  onRetry,
  orderUrl,
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

  if (isTimedOut) {
    return (
      <div className={SHELL_CLASS_NAME}>
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red/10 text-red">
          <IconAlertCircleFilled size={36} />
        </span>

        <div>
          <h1 className="text-lg font-medium text-black">
            {t("order_page_waiting_timeout_title")}
          </h1>
          <p className="mt-1 text-sm text-gray220">
            {t("order_page_waiting_timeout_hint")}
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          {orderUrl && (
            <Button
              type="button"
              variant="primary-solid"
              size="primaryWide"
              onClick={() => router.push(orderUrl)}
            >
              {t("order_page_waiting_view_order")}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="primaryWide"
            onClick={() => {
              onRetry();
              if (paymentUrl) openPaymentLink(paymentUrl);
            }}
          >
            {t("common_retry")}
          </Button>
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
  }

  return (
    <div className={SHELL_CLASS_NAME}>
      <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full border border-gray180 bg-gray180/70 text-gray220">
        <IconClockFilled size={36} />
      </span>

      <div>
        <h1 className="text-lg font-medium text-black">
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

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          disabled={!onCheck || isChecking}
          onClick={onCheck}
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
