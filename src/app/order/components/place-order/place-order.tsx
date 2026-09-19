"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { formatPrice } from "@/utils/format-price";

type PlaceOrderProps = {
  displayTotal: number;
  isSubmitting: boolean;
};

const PlaceOrder = ({ displayTotal, isSubmitting }: PlaceOrderProps) => {
  const t = useTranslations();

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 rounded-t-2xl border-t border-gray180 bg-white">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div>
          <p className="text-xs font-medium text-gray220">
            {t("order_page.payment.amount")}
          </p>
          <p className="text-lg font-extrabold text-black">
            {formatPrice(displayTotal)} {t("sum")}
          </p>
        </div>
        <Button
          type="submit"
          variant="primary-solid"
          size="primaryFit"
          disabled={isSubmitting}
        >
          {t("checkout")}
        </Button>
      </div>
    </div>
  );
};

export default PlaceOrder;
