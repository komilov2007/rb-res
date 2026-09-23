import { IconShoppingCartFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import type { CartViewProps } from "@/types/cart";

export const EmptyCart = ({ isMobile }: CartViewProps) => {
  const t = useTranslations();
  const closeCartModal = useCartStore((state) => state.closeCartModal);

  return (
    <div
      className={
        isMobile
          ? "flex min-h-[340px] flex-col items-center justify-center px-6 text-center"
          : "flex h-full min-h-[400px] flex-col items-center justify-center px-6 text-center"
      }
    >
      <div
        className={
          isMobile
            ? "flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220"
            : "flex h-20 w-20 items-center justify-center rounded-full bg-gray10 text-gray220"
        }
      >
        <IconShoppingCartFilled size={isMobile ? 28 : 32} />
      </div>

      <h3
        className={
          isMobile
            ? "mt-4 text-base font-medium text-black"
            : "mt-5 text-lg font-medium text-black"
        }
      >
        {t("empty_cart")}
      </h3>

      <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray220">
        {t("add_products_hint")}
      </p>

      <Button
        type="button"
        variant="primary-solid"
        size="primaryFit"
        onClick={closeCartModal}
        className="mt-5"
      >
        {t("continue_shopping")}
      </Button>
    </div>
  );
};
