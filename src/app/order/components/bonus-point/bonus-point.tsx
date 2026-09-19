"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Switch } from "@/components/ui/switch";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { formatPrice } from "@/utils/format-price";
import type { OrderFormValues } from "@/types/order";

// Rendered by order.tsx only when general.cashback_enabled is true. Only the
// spend_cashback flag is submitted — the backend deducts the balance itself.
const BonusPoint = () => {
  const t = useTranslations();
  const { control } = useFormContext<OrderFormValues>();
  const { data: general } = useGeneral();
  const { data: profile } = useProfile();
  const cashbackBall = profile?.data.cashback_ball ?? 0;

  return (
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-black">
            {t("order_page.bonus.title")}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-gray220">
            {t("order_page.bonus.rate", {
              amount: general?.data.cashback_amount ?? 0,
              currency: general?.data.currency?.code ?? "",
            })}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-gray10 px-3 py-1 text-sm font-bold text-black">
          {t("order_page.bonus.balance", { ball: formatPrice(cashbackBall) })}
        </span>
      </div>

      <hr className="my-3 border-gray180" />

      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-normal text-black">
          {t("order_page.bonus.use")}
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
