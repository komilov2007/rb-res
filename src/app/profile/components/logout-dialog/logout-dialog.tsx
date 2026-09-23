"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

// "Chiqasizmi?" confirmation — shared by the mobile profile page and the
// desktop profile sidebar.
const LogoutDialog = ({ open, onOpenChange, onConfirm }: LogoutDialogProps) => {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[340px] rounded-3xl bg-white p-5"
        showCloseButton={false}
      >
        <DialogTitle className="text-center text-xl font-medium text-black">
          {t("profile_page_logout_dialog_title")}
        </DialogTitle>
        <DialogDescription className="text-center text-sm font-normal text-gray220">
          {t("profile_page_logout_dialog_description")}
        </DialogDescription>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl"
          >
            {t("common_cancel")}
          </Button>
          <Button
            type="button"
            variant="plain"
            size="lg"
            onClick={onConfirm}
            className="rounded-2xl bg-red/10 text-red"
          >
            {t("logout")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
