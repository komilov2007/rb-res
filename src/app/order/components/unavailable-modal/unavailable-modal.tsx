"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShopId } from "@/hooks/useShopId";
import { useCartStore } from "@/stores/cart";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CalendarClock } from "lucide-react";
import { useTranslations as useTranslationsShippingTime } from "next-intl";
import { Input } from "@/components/ui/input";
import type { OrderFormValues } from "@/types/order";

type UnavailableModalProps = {
  open: boolean;
  unavailableItemIds: number[];
  onClose: () => void;
};

const UnavailableModal = ({
  open,
  unavailableItemIds,
  onClose,
}: UnavailableModalProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const openCartModal = useCartStore((state) => state.openCartModal);
  const setUnavailableItemIds = useCartStore(
    (state) => state.setUnavailableItemIds,
  );

  const handleBackToCart = () => {
    onClose();
    setUnavailableItemIds(unavailableItemIds);
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    openCartModal(isDesktop ? "desktop" : "mobile");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center font-normal leading-snug">
            {t("unavailable_products_hint")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("unavailable_products_title")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row border-t-0 bg-white">
          <Button
            type="button"
            variant="outline"
            size="dialogAction"
            onClick={onClose}
          >
            {t("choose_another_branch")}
          </Button>
          <Button
            type="button"
            variant="primary-solid"
            size="dialogAction"
            onClick={handleBackToCart}
          >
            {t("back_to_cart")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnavailableModal;

const ShippingTime = () => {
  const t = useTranslationsShippingTime();
  const { control } = useFormContext<OrderFormValues>();
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

export { ShippingTime };
