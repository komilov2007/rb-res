import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { formatPrice } from "@/utils/format-price";
import type { CartViewProps } from "@/types/cart";

type CartFooterProps = CartViewProps & {
  total: number;
};

const CartFooter = ({ isMobile, total }: CartFooterProps) => {
  const t = useTranslations();

  return (
    <div
      className={
        isMobile
          ? "shrink-0 border-t border-gray180 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4"
          : "shrink-0 border-t border-gray180 bg-white px-6 pb-6 pt-5"
      }
    >
      <div className="flex items-center justify-between gap-5">
        <span
          className={
            isMobile
              ? "text-base font-extrabold text-black"
              : "text-lg font-extrabold text-black"
          }
        >
          {t("total")}
        </span>

        <span
          className={
            isMobile
              ? "text-xl font-extrabold text-black"
              : "text-2xl font-extrabold text-black"
          }
        >
          {formatPrice(total)} {t("sum")}
        </span>
      </div>

      <Button
        type="button"
        variant="primary-solid"
        size="primaryWide"
        className="mt-4"
      >
        {t("checkout")}
      </Button>
    </div>
  );
};

export default CartFooter;
