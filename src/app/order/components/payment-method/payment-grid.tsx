"use client";

import { Check } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { OrderFormValues, PaymentTypeProps } from "@/types/order";

import { PAYMENT_CARD_CONFIG, getPaymentIcon } from "./constants";

const RadioIndicator = ({
  checked,
  hasError = false,
  className = "",
}: {
  checked: boolean;
  hasError?: boolean;
  className?: string;
}) => (
  <span
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
      checked ? "border-green-500 bg-green-500" : hasError ? "border-red" : "border-gray180"
    } ${className}`}
  >
    {checked && <Check size={12} strokeWidth={3} className="text-white" />}
  </span>
);

type PaymentGridProps = {
  visiblePaymentTypes: PaymentTypeProps[];
  getIsDisabled: (type: PaymentTypeProps) => boolean;
};

// Renders the payment types returned by the payment-list query, with each
// card's disabled state from that same response.
const PaymentGrid = ({ visiblePaymentTypes, getIsDisabled }: PaymentGridProps) => {
  const t = useTranslations();
  const {
    control,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const hasError = Boolean(errors.payment_type);

  return (
    <Controller
      control={control}
      name="payment_type"
      render={({ field }) => (
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          {visiblePaymentTypes.map((type) => {
            const config = PAYMENT_CARD_CONFIG[type];

            if (!config) return null;

            const checked = field.value === type;
            const isDisabled = getIsDisabled(type);
            const Icon = getPaymentIcon(type);
            const caption = t("order_page.payment.caption", { label: config.label });

            const handleSelect = () => {
              if (isDisabled) return;

              field.onChange(type);
            };

            return (
              <button
                key={type}
                type="button"
                onClick={handleSelect}
                disabled={isDisabled}
                className={`flex flex-col gap-2 rounded-2xl border p-3 text-left ${
                  isDisabled ? "pointer-events-none opacity-50" : ""
                } ${
                  checked
                    ? "border-green-500 bg-green-500/10"
                    : hasError
                      ? "border-red bg-white"
                      : "border-gray180 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 shrink-0 items-center justify-start overflow-hidden [&_svg]:h-auto [&_svg]:max-h-8 [&_svg]:w-auto [&_svg]:max-w-30">
                    <Icon />
                  </span>
                  <RadioIndicator
                    checked={checked && !isDisabled}
                    hasError={hasError}
                  />
                </div>
                <span className="text-sm font-normal text-black">
                  {caption}
                </span>
              </button>
            );
          })}
        </div>
      )}
    />
  );
};

export default PaymentGrid;
