"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { useLanguage } from "@/components/language/useLanguage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { languages } from "@/constants/language";

type LanguageSheetProps = {
  open: boolean;
  onClose: () => void;
};

// Profile "Til" row picker — same switching logic as the header's language
// select (useLanguage): cookie + localStorage, then refresh. Mobile keeps
// the bottom sheet; desktop swaps to a centered Dialog, matching every
// other mobile-sheet/desktop-dialog pair in this project (login/signup,
// edit-name, branch selection).
const LanguageSheet = ({ open, onClose }: LanguageSheetProps) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { safeValue, availableLanguages, handleChangeLanguage } = useLanguage();

  const options = availableLanguages.map((key) => {
    const language = languages[key];
    const Icon = language.Icon;
    const checked = key === safeValue;

    return (
      <button
        key={key}
        type="button"
        data-language={key}
        onClick={() => {
          handleChangeLanguage(key);
          onClose();
        }}
        className={`flex h-11 items-center gap-3 rounded-xl border px-3 text-left transition-colors ${
          checked ? "border-green-500 bg-green-500/10" : "border-gray180"
        }`}
      >
        <Icon />
        <span className="flex-1 text-sm font-medium text-black">
          {language.label}
        </span>
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
            checked
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray180"
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
      </button>
    );
  });

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[380px] rounded-3xl border border-gray180 bg-white p-6"
        >
          <DialogTitle className="text-lg font-bold text-black">
            {t("profile_page_language_sheet_title")}
          </DialogTitle>
          <div className="mt-4 flex flex-col gap-2">{options}</div>
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
          {options}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LanguageSheet;
