"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";

import Input from "@/components/ui/input";
import type { OrderFormValues } from "@/types/order";

// Rendered only for services with shipping_time: true. Optional, but date and
// time must be picked together (schema.ts); usePage joins them into
// shipping_datetime.
const ShippingTime = () => {
  const t = useTranslations();
  const { control } = useFormContext<OrderFormValues>();
  // Local YYYY-MM-DD, used as the earliest selectable date.
  const [today] = useState(() => new Date().toLocaleDateString("en-CA"));

  return (
    <section className="rounded-xl bg-white p-3">
      <h2 className="flex items-center gap-2 text-sm font-medium text-black">
        <CalendarClock size={18} className="text-gray220" />
        {t("order_page_shipping_title")}
      </h2>
      <p className="mt-0.5 text-xs font-normal text-gray220">
        {t("order_page_shipping_hint")}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Controller
          control={control}
          name="shipping_date"
          rules={{ deps: ["shipping_time"] }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                type="date"
                aria-label={t("order_page_shipping_date")}
                min={today}
                wrapperClassName="!h-11 !rounded-lg !px-3"
                className="text-black"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value || null)}
              />
              {fieldState.error && (
                <span className="mt-1 block px-1 text-xs text-red">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="shipping_time"
          rules={{ deps: ["shipping_date"] }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                type="time"
                aria-label={t("order_page_shipping_time")}
                wrapperClassName="!h-11 !rounded-lg !px-3"
                className="text-black"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value || null)}
              />
              {fieldState.error && (
                <span className="mt-1 block px-1 text-xs text-red">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>
    </section>
  );
};

export default ShippingTime;
