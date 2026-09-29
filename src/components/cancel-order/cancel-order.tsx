"use client";

import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import { IconPhoneFilled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGeneral } from "@/hooks/useGeneral";
import type { OrderStatusValue } from "@/types/order";

type CancelOrderProps = {
  status: OrderStatusValue;
  onCancel: () => void;
  isCancelling: boolean;
  cancelError: string | null;
};

// Only NEW orders can actually be cancelled (confirmed). PROGRESS orders
// are already being prepared, so the reference offers a "call the shop"
// affordance instead — reuses the same business_phone field/tel: link
// pattern already established in profile.tsx, no new field invented.
const CancelOrder = ({
  status,
  onCancel,
  isCancelling,
  cancelError,
}: CancelOrderProps) => {
  const t = useTranslations();
  const { data: general } = useGeneral();
  const businessPhone = general?.data.business_phone;
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (status === "NEW") {
    return (
      <div>
        {/* Stays disabled with a spinner for the whole cancel round-trip —
            the hooks' onSuccess awaits the detail refetch, so isCancelling
            only drops once this block is replaced by the cancelled state. */}
        <Button
          type="button"
          variant="destructive"
          size="primaryWide"
          disabled={isCancelling}
          onClick={() => setConfirmOpen(true)}
          className="font-medium"
        >
          {isCancelling ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Ban size={17} />
          )}
          {isCancelling ? t("orders_cancel_cancelling") : t("orders_cancel_button")}
        </Button>
        {cancelError && (
          <span className="mt-2 block text-xs text-red">{cancelError}</span>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogTitle>{t("orders_cancel_confirm_title")}</DialogTitle>
            <DialogDescription>
              {t("orders_cancel_confirm_description")}
            </DialogDescription>
            <DialogFooter className="flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="dialogAction"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 font-medium"
              >
                {t("common_no")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="dialogAction"
                disabled={isCancelling}
                className="flex-1 font-medium"
                onClick={() => {
                  onCancel();
                  setConfirmOpen(false);
                }}
              >
                {t("orders_cancel_confirm_yes")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (status === "PROGRESS" && businessPhone) {
    return (
      <a
        href={`tel:${businessPhone}`}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary10 text-sm font-medium text-primary"
      >
        <IconPhoneFilled size={16} />
        {t("orders_cancel_call_shop")}
      </a>
    );
  }

  return null;
};

export default CancelOrder;
