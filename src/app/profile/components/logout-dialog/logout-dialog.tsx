"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations as useTranslationsLanguageSheet } from "next-intl";
import { Dialog as DialogLanguageSheet, DialogContent as DialogContentLanguageSheet, DialogTitle as DialogTitleLanguageSheet } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { LanguageOptions } from "@/app/profile/components/account-card";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

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

type LanguageSheetProps = {
  open: boolean;
  onClose: () => void;
};

const LanguageSheet = ({ open, onClose }: LanguageSheetProps) => {
  const t = useTranslationsLanguageSheet();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <DialogLanguageSheet open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContentLanguageSheet
          showCloseButton={false}
          className="max-w-[380px] rounded-3xl border border-gray180 bg-white p-6"
        >
          <DialogTitleLanguageSheet className="text-lg font-medium text-black">
            {t("profile_page_language_sheet_title")}
          </DialogTitleLanguageSheet>
          <div className="mt-4 flex flex-col gap-2">
            <LanguageOptions onSelect={onClose} />
          </div>
        </DialogContentLanguageSheet>
      </DialogLanguageSheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-gray180 shadow-none"
      >
        <SheetHeader>
          <SheetTitle>{t("profile_page_language_sheet_title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <LanguageOptions onSelect={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { LanguageSheet };
