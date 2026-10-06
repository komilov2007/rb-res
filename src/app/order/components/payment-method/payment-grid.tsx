"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { OrderFormValues, PaymentTypeProps } from "@/types/order";
import { RadioMark } from "@/components/ui/radio-mark";
import { PAYMENT_CARD_CONFIG, getPaymentIcon, PAYMENT_TYPE_ICON_MAP } from "@/constants/payment-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPaymentList, type PaymentListItem } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

type PaymentGridProps = {
  visiblePaymentTypes: PaymentTypeProps[];
  getIsDisabled: (type: PaymentTypeProps) => boolean;
};

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

const ROBO_VARIANTS = ["ROBO_CLICK", "ROBO_PAYME", "ROBO_UZUM"] as const;

const ALL_ICON_MAPPED_TYPES = Object.keys(
  PAYMENT_TYPE_ICON_MAP,
) as PaymentTypeProps[];

const getVisiblePaymentTypes = (data: PaymentListItem[]): PaymentTypeProps[] => {
  const hasRoboPay = data.some((item) => item.state === "ROBO_PAY");

  return ALL_ICON_MAPPED_TYPES.reduce<PaymentTypeProps[]>((acc, type) => {
    const isInResponse = data.some((item) => item.state === type);
    const isRoboVariant = (ROBO_VARIANTS as readonly string[]).includes(type);
    const autoIncluded = hasRoboPay && isRoboVariant;

    if (!isInResponse && !autoIncluded) return acc;

    acc.push(type);

    return acc;
  }, []);
};

const isPaymentTypeDisabled = (
  type: PaymentTypeProps,
  data: PaymentListItem[],
): boolean => {
  if ((ROBO_VARIANTS as readonly string[]).includes(type)) {
    const roboPay = data.find((item) => item.state === "ROBO_PAY");

    return roboPay?.is_available === false;
  }

  const item = data.find((item) => item.state === type);

  return item?.is_available === false;
};

type PaymentMethodQueryProps = {
  shopid: string;
  deliveryType: string;
};

const PaymentMethodQuery = ({ shopid, deliveryType }: PaymentMethodQueryProps) => {
  const { data } = useSuspenseQuery({
    queryKey: [REACT_QUERY_KEYS.PAYMENT_LIST, shopid, deliveryType],
    queryFn: () => getPaymentList(shopid, deliveryType),
  });

  const paymentList = data?.data ?? [];
  const visiblePaymentTypes = getVisiblePaymentTypes(paymentList);

  return (
    <PaymentGrid
      visiblePaymentTypes={visiblePaymentTypes}
      getIsDisabled={(type) => isPaymentTypeDisabled(type, paymentList)}
    />
  );
};

const PaymentMethodSkeleton = () => (
  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="skeleton h-21.5 rounded-xl" />
    ))}
  </div>
);

export { PaymentMethodQuery, PaymentMethodSkeleton };

export default PaymentGrid;
