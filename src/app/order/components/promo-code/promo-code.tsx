"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronDown, Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { getPromoCode } from "@/apis/order";
import { getApiErrorMessage } from "@/utils/api-error";
import type { OrderFormValues } from "@/types/order";

// Rendered inside the payment block. Owns its own mutation (Section 22.7:
// promo-code has no local hook) and writes the result straight into the
// order form: promocode_id (sent with the order), promocode and total (the
// backend's discounted cart total, used by usePage's price calculation).
// Inline expand — not a Sheet/bottom drawer — tapping the trigger opens the
// input + apply button directly below it, in normal document flow.
const PromoCode = () => {
  const t = useTranslations();
  const { control, setValue } = useFormContext<OrderFormValues>();
  const promocode = useWatch({ control, name: "promocode" });
  const { shopid } = useShopId();
  const customerId = useAuthStore((state) => state.auth?.customer);

  const [isOpen, setIsOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  const promoCodeMutation = useMutation({
    mutationFn: (code: string) =>
      getPromoCode(shopid as string, customerId as number, code),
    onSuccess: (response) => {
      setValue("promocode_id", response.data.id);
      setValue("promocode", response.data.promo_code);
      setValue("total", response.data.total_amount);
      setPromoError(null);
      setIsOpen(false);
      toast.success(
        t("order_page_promo_applied", { code: response.data.promo_code }),
      );
    },
    // The backend's own message (e.g. "Promo-kod topilmadi", "Eng kam
    // miqdor ... dan katta bo'lishi kerak", "Siz allaqachon birinchi
    // buyurtmangizni berdingiz") — not a single hardcoded string, since
    // which of those it is changes what the user should actually do next.
    onError: (error) => {
      setPromoError(getApiErrorMessage(error, t("order_page_promo_error")));
    },
  });

  const toggleOpen = () => {
    if (!isOpen) {
      setPromoCodeInput(promocode ?? "");
      setPromoError(null);
    }

    setIsOpen((value) => !value);
  };

  const applyPromoCode = () => {
    if (!shopid || !customerId || !promoCodeInput.trim()) return;

    promoCodeMutation.mutate(promoCodeInput.trim());
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray180 px-3 py-3"
      >
        <span className="flex min-w-0 items-center gap-2 text-sm font-normal text-black">
          <Ticket size={18} className="shrink-0 text-gray220" />
          <span className="truncate">
            {promocode
              ? t("order_page_promo_current", { code: promocode })
              : t("order_page_promo_question")}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray220 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder={t("order_page_promo_placeholder")}
              wrapperClassName="!h-11"
              value={promoCodeInput}
              onChange={(event) => {
                setPromoCodeInput(event.target.value);
                if (promoError) setPromoError(null);
              }}
            />
            <Button
              type="button"
              variant="primary-solid"
              size="md"
              className="shrink-0"
              disabled={promoCodeMutation.isPending || !promoCodeInput.trim()}
              onClick={applyPromoCode}
            >
              {t("order_page_promo_apply")}
            </Button>
          </div>
          {promoError && (
            <span className="mt-2 block text-xs text-red">{promoError}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCode;
