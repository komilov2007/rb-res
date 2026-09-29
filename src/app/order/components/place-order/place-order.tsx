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
    <div className="fixed inset-x-0 bottom-0 z-10 rounded-t-xl border-t border-gray180 bg-white lg:static lg:rounded-none lg:border-t-0 lg:bg-transparent">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:max-w-none lg:p-0">
        {/* Desktop shows the total in the summary above. */}
        <div className="lg:hidden">
          <p className="info-label">
            {t("order_page_payment_amount")}
          </p>
          <p className="text-lg font-medium text-black">
            {formatPrice(displayTotal)} {t("sum")}
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

export default PlaceOrder;
