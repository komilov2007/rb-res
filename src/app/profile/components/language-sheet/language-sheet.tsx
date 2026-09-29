"use client";

import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import LanguageOptions from "../language-options";

type LanguageSheetProps = {
  open: boolean;
  onClose: () => void;
};

// Mobile profile "Til" row picker (the desktop sidebar goes to the
// /profile/language page instead). Mobile keeps the bottom sheet; the
// Dialog branch only covers the mobile row being used at desktop width.
const LanguageSheet = ({ open, onClose }: LanguageSheetProps) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[380px] rounded-3xl border border-gray180 bg-white p-6"
        >
          <DialogTitle className="text-lg font-medium text-black">
            {t("profile_page_language_sheet_title")}
          </DialogTitle>
          <div className="mt-4 flex flex-col gap-2">
            <LanguageOptions onSelect={onClose} />
          </div>
        </DialogContent>
      </Dialog>
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

export default LanguageSheet;
