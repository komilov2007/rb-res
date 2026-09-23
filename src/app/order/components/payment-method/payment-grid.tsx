"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { OrderFormValues, PaymentTypeProps } from "@/types/order";
import RadioMark from "@/components/ui/radio-mark";

import { PAYMENT_CARD_CONFIG, getPaymentIcon } from "@/constants/payment-types";

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
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-3">
          {visiblePaymentTypes.map((type) => {
            const config = PAYMENT_CARD_CONFIG[type];

            if (!config) return null;

            const checked = field.value === type;
            const isDisabled = getIsDisabled(type);
            const Icon = getPaymentIcon(type);
            const caption = t("order_page_payment_caption", { label: config.label });

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
                className={`flex flex-col gap-2 rounded-2xl border p-3 text-left transition-colors duration-200 ${
                  isDisabled ? "pointer-events-none opacity-50" : ""
                } ${
                  // White bordered cards (unlike the gray option rows used
                  // elsewhere); green when selected, red on a field error.
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
                  <RadioMark checked={checked && !isDisabled} />
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
