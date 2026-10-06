"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/skeleton";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { formatPrice } from "@/utils/format-price";
import type { OrderFormValues } from "@/types/order";
import { useTranslations as useTranslationsPlaceOrder } from "next-intl";
import Button from "@/components/ui/button";
import { formatPrice as formatPricePlaceOrder } from "@/utils/format-price";

const BonusPoint = () => {
  const t = useTranslations();
  const { control } = useFormContext<OrderFormValues>();
  const { data: general } = useGeneral();
  const { data: profile } = useProfile();
  const cashbackBall = profile?.data.cashback_ball ?? 0;

  return (
    <section className="rounded-xl bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-black">
            {t("order_page_bonus_title")}
          </h2>
          <p className="mt-0.5 text-xs font-normal text-gray220">
            {t("order_page_bonus_rate", {
              amount: general?.data.cashback_amount ?? 0,
              currency: general?.data.currency?.code ?? "",
            })}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-gray10 px-3 py-1 text-sm font-medium text-black">
          {t("order_page_bonus_balance", { ball: formatPrice(cashbackBall) })}
        </span>
      </div>

      <hr className="my-3 border-gray180" />

      <label className="flex items-center justify-between gap-2">
        <span className="text-sm font-normal text-black">
          {t("order_page_bonus_use")}
        </span>
        <Controller
          control={control}
          name="spend_cashback"
          render={({ field }) => (
            <Switch
              checked={field.value ?? false}
              disabled={cashbackBall === 0}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </label>
    </section>
  );
};

export default BonusPoint;

type PlaceOrderProps = {
  displayTotal: number;
  isSubmitting: boolean;
};

const PlaceOrder = ({ displayTotal, isSubmitting }: PlaceOrderProps) => {
  const t = useTranslationsPlaceOrder();

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 rounded-t-xl border-t border-gray180 bg-white lg:static lg:rounded-none lg:border-t-0 lg:bg-transparent">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:max-w-none lg:p-0">
        <div className="lg:hidden">
          <p className="info-label">
            {t("order_page_payment_amount")}
          </p>
          <p className="text-lg font-medium text-black">
            {formatPricePlaceOrder(displayTotal)} {t("sum")}
          </p>
        </div>
        <Button
          type="submit"
          variant="primary-solid"
          size="primaryFit"
          className="lg:h-14 lg:w-full lg:rounded-2xl"
          disabled={isSubmitting}
        >
          {t("checkout")}
        </Button>
      </div>
    </div>
  );
};

export { PlaceOrder };
