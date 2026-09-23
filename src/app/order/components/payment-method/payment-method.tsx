"use client";

import { Suspense } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useShopId } from "@/hooks/useShopId";
import type { OrderFormValues } from "@/types/order";

import PromoCode from "../promo-code";
import PaymentMethodErrorBoundary from "./error-boundary";
import PaymentMethodQuery from "./payment-method-query";
import PaymentMethodSkeleton from "./skeleton";

type PaymentMethodProps = {
  // Mobile keeps the promo code here; desktop shows it in the summary panel.
  showPromoCode: boolean;
};

const PaymentMethod = ({ showPromoCode }: PaymentMethodProps) => {
  const t = useTranslations();
  const { control } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const { shopid, hasShopId } = useShopId();

  // useSuspenseQuery always fetches on mount — unlike useQuery there's no
  // `enabled` escape hatch, so the query-owning subtree below is only ever
  // mounted once its dependencies are real (delivery_type is set once
  // general.services is available).
  const isReady = hasShopId && Boolean(deliveryType);

  return (
    <section className="rounded-xl bg-white p-3">
      <h2 className="text-sm font-medium text-black">
        {t("order_page_payment_title")}
      </h2>

      {isReady ? (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <PaymentMethodErrorBoundary
              key={deliveryType}
              onReset={reset}
              fallback={(retry) => (
                <div className="mt-2 flex flex-col items-start gap-2">
                  <p className="text-xs font-normal text-gray220">
                    {t("order_page_payment_load_error")}
                  </p>
                  <Button
                    type="button"
                    variant="plain"
                    size="none"
                    onClick={retry}
                    className="h-9 rounded-lg bg-gray10 px-4 text-sm font-medium text-black"
                  >
                    {t("common_retry")}
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

      {showPromoCode && <PromoCode />}
    </section>
  );
};

export default PaymentMethod;
