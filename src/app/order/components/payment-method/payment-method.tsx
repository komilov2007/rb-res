"use client";

import { Component, type ReactNode, Suspense } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import { useShopId } from "@/hooks/useShopId";
import type { OrderFormValues } from "@/types/order";
import PromoCode from "@/app/order/components/promo-code/index";
import { PaymentMethodQuery } from "./payment-grid";
import { PaymentMethodSkeleton } from "./payment-grid";

type PaymentMethodErrorBoundaryProps = {
  fallback: (retry: () => void) => ReactNode;
  onReset?: () => void;
  children: ReactNode;
};

type PaymentMethodErrorBoundaryState = {
  hasError: boolean;
};

class PaymentMethodErrorBoundary extends Component<
  PaymentMethodErrorBoundaryProps,
  PaymentMethodErrorBoundaryState
> {
  state: PaymentMethodErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  retry = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) return this.props.fallback(this.retry);

    return this.props.children;
  }
}

type PaymentMethodProps = {
  showPromoCode: boolean;
};

const PaymentMethod = ({ showPromoCode }: PaymentMethodProps) => {
  const t = useTranslations();
  const { control } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const { shopid, hasShopId } = useShopId();

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

export { PaymentMethod };

export default PaymentMethod;
