"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReservationProps } from "@/types/reservation";

type CancelReservationDialogProps = {
  reservation: ReservationProps | null;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: (reservation: ReservationProps) => void;
};

const CancelReservationDialog = ({
  reservation,
  isCancelling,
  onClose,
  onConfirm,
}: CancelReservationDialogProps) => {
  const t = useTranslations();

  return (
    <Dialog
      open={Boolean(reservation)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        className="max-w-[340px] rounded-3xl bg-white p-5"
        showCloseButton={false}
      >
        <DialogTitle className="text-center text-xl font-medium text-black">
          {t("reservations_cancel_confirm_title")}
        </DialogTitle>
        <DialogDescription className="text-center text-sm font-normal text-gray220">
          {t("orders_cancel_confirm_description")}
        </DialogDescription>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="rounded-2xl"
          >
            {t("common_no")}
          </Button>
          <Button
            type="button"
            variant="plain"
            size="lg"
            disabled={isCancelling}
            onClick={() => reservation && onConfirm(reservation)}
            className="rounded-2xl bg-red/10 text-red"
          >
            {t("orders_cancel_confirm_yes")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelReservationDialog;
