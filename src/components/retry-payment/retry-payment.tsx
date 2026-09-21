"use client";

import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { formatPrice } from "@/utils/format-price";
import type { OrderStatusValue } from "@/types/order";

type RetryPaymentProps = {
  amount: number;
  isPaid: boolean;
  status: OrderStatusValue;
  onRetry: () => void;
  isPaying: boolean;
};

const RetryPayment = ({
  amount,
  isPaid,
  status,
  onRetry,
  isPaying,
}: RetryPaymentProps) => {
  const t = useTranslations();

  if (isPaid || status === "CANCEL" || status === "CANCELED_BY_CUSTOMER") {
    return null;
  }

  return (
    <Button
      type="button"
      variant="primary-solid"
      size="primaryWide"
      disabled={isPaying}
      onClick={onRetry}
      className="font-medium"
    >
      <CreditCard size={17} />
      {t("orders_pay_amount", {
        amount: `${formatPrice(amount)} ${t("sum")}`,
      })}
    </Button>
  );
};

export default RetryPayment;
