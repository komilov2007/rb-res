"use client";

import { type KeyboardEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronDown, Loader2, X } from "lucide-react";
import { IconRosetteDiscountFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { getPromoCode } from "@/apis/order";
import { getApiErrorMessage } from "@/utils/api-error";
import type { OrderFormValues } from "@/types/order";

// Owns its own mutation (Section 22.7: promo-code has no local hook) and
// writes the result straight into the order form: promocode_id (sent with
// the order), promocode and total (the backend's discounted cart total, used
// by the price calculation). Mobile: inline expand under the trigger.
// Desktop: the same form in a centered dialog. An applied code shows as a
// green row with a remove button.
const PromoCode = () => {
  const t = useTranslations();
  const { control, setValue } = useFormContext<OrderFormValues>();
  const promocode = useWatch({ control, name: "promocode" });
  const { shopid } = useShopId();
  const customerId = useAuthStore((state) => state.auth?.customer);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
  const isApplying = promoCodeMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    if (open) setPromoCodeInput(promocode ?? "");
    setPromoError(null);
    setIsOpen(open);
  };

  const applyPromoCode = () => {
    const code = promoCodeInput.trim();

    if (!shopid || !customerId || !code || isApplying) return;

    promoCodeMutation.mutate(code);
  };

  const removePromoCode = () => {
    setValue("promocode_id", null);
    setValue("promocode", null);
    setValue("total", null);
    setPromoCodeInput("");
    setPromoError(null);
  };

  // Enter applies the code instead of submitting the whole order form.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    applyPromoCode();
  };

  const promoForm = (
    <div>
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder={t("order_page_promo_placeholder")}
          wrapperClassName={`!h-11 ${promoError ? "!border-red" : ""}`}
          value={promoCodeInput}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setPromoCodeInput(event.target.value);
            if (promoError) setPromoError(null);
          }}
        />
        <Button
          type="button"
          variant="primary-solid"
          size="md"
          className="min-w-24 shrink-0"
          disabled={isApplying || !promoCodeInput.trim()}
          onClick={applyPromoCode}
        >
          {isApplying ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            t("order_page_promo_apply")
          )}
        </Button>
      </div>
      {promoError && (
        <span className="mt-2 block text-xs text-red">{promoError}</span>
      )}
    </div>
  );

  return (
    <div className="mt-2 lg:mt-0">
      <div
        className={`flex w-full items-center gap-2 rounded-lg border transition-colors lg:h-14 lg:rounded-2xl ${
          promocode
            ? "border-green-500/40 bg-green-500/10"
            : "border-gray180 lg:border-transparent lg:bg-gray10 lg:hover:bg-gray180"
        }`}
      >
        <button
          type="button"
          onClick={() => handleOpenChange(!isOpen)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 self-stretch px-3 py-3 text-left lg:px-4"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-normal text-black">
            <IconRosetteDiscountFilled
              size={18}
              className={`shrink-0 ${promocode ? "text-green-500" : "text-gray220"}`}
            />
            <span className="truncate">
              {promocode
                ? t("order_page_promo_current", { code: promocode })
                : t("order_page_promo_question")}
            </span>
          </span>
          {!promocode && (
            <ChevronDown
              size={18}
              className={`shrink-0 text-gray220 transition-transform lg:-rotate-90 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {promocode && (
          <button
            type="button"
            onClick={removePromoCode}
            aria-label={t("common_delete")}
            className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray220 transition-colors hover:bg-white hover:text-black lg:mr-3"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="gap-4 rounded-2xl p-5 sm:max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-base font-medium">
                {t("order_page_promo_question")}
              </DialogTitle>
            </DialogHeader>
            {promoForm}
          </DialogContent>
        </Dialog>
      ) : (
        isOpen && <div className="mt-2">{promoForm}</div>
      )}
    </div>
  );
};

export default PromoCode;
