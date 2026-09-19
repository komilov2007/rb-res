"use client";

import { Suspense } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useShopid } from "@/hooks/useShopId";
import type { OrderFormValues } from "@/types/order";

import PromoCode from "../promo-code";
import PaymentMethodErrorBoundary from "./error-boundary";
import PaymentMethodQuery from "./payment-method-query";
import PaymentMethodSkeleton from "./skeleton";

const PaymentMethod = () => {
  const t = useTranslations();
  const { control } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const { shopid, hasShopId } = useShopid();

  // useSuspenseQuery always fetches on mount — unlike useQuery there's no
  // `enabled` escape hatch, so the query-owning subtree below is only ever
  // mounted once its dependencies are real (delivery_type is set once
  // general.services is available).
  const isReady = hasShopId && Boolean(deliveryType);

  return (
    <section className="rounded-2xl bg-white p-4">
      <h2 className="text-sm font-bold text-black">
        {t("order_page.payment.title")}
      </h2>

      {isReady ? (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <PaymentMethodErrorBoundary
              key={deliveryType}
              onReset={reset}
              fallback={(retry) => (
                <div className="mt-3 flex flex-col items-start gap-2">
                  <p className="text-xs font-medium text-gray220">
                    {t("order_page.payment.load_error")}
                  </p>
                  <Button
                    type="button"
                    variant="plain"
                    size="none"
                    onClick={retry}
                    className="h-9 rounded-xl bg-gray10 px-4 text-sm font-bold text-black"
                  >
                    {t("common.retry")}
                  </Button>
                </div>
              )}
            >
              <Suspense fallback={<PaymentMethodSkeleton />}>
                <PaymentMethodQuery
                  shopid={shopid as string}
                  deliveryType={deliveryType as string}
                />
              </Suspense>
            </PaymentMethodErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      ) : (
        <PaymentMethodSkeleton />
      )}

      <PromoCode />
    </section>
  );
};

export default PaymentMethod;
