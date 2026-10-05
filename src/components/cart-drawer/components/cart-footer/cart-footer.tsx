import { useTranslations } from "next-intl";
import { IconTruckFilled } from "@tabler/icons-react";

import Button from "@/components/ui/button";
import { formatPrice } from "@/utils/format-price";
import type { CartViewProps } from "@/types/cart";

type CartFooterProps = CartViewProps & {
  total: number;
  deliveryPrice: number;
  onContinue: () => void;
  isPending: boolean;
};

const CartFooter = ({
  isMobile,
  total,
  deliveryPrice,
  onContinue,
  isPending,
}: CartFooterProps) => {
  const t = useTranslations();

  return (
    <div
      className={
        isMobile
          ? "shrink-0 border-t border-gray180 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4"
          : "shrink-0 border-t border-gray180 bg-white px-6 pb-6 pt-5"
      }
    >
      {deliveryPrice > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="info-label flex items-center gap-2">
            <IconTruckFilled size={16} className="text-gray220" />
            {t("cart_drawer_delivery_price")}
          </span>
          <span className="text-sm font-medium text-black">
            {formatPrice(deliveryPrice)} {t("sum")}
          </span>
        </div>
      )}

      <Button
        variant="primary-solid"
        size="primaryWide"
        onClick={onContinue}
        disabled={isPending || total <= 0}
      >
        {t("checkout")} · {formatPrice(total)} {t("sum")}
      </Button>
    </div>
  );
};

export default CartFooter;
