"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type CommentDrawerProps = {
  open: boolean;
  value: string | null;
  onClose: () => void;
  onSave: (value: string | null) => void;
};

// The parent remounts this via `key` on every open, so the draft always
// starts from the saved comment (same approach as recipient-drawer).
// Mobile: bottom sheet. Desktop: centered dialog.
const CommentDrawer = ({ open, value, onClose, onSave }: CommentDrawerProps) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [draft, setDraft] = useState(value ?? "");

  const handleSave = () => {
    onSave(draft.trim() || null);
    onClose();
  };

  const textarea = (
    <textarea
      autoFocus
      rows={4}
      placeholder={t("order_page_comment_placeholder")}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
      className="w-full resize-none rounded-lg border border-transparent bg-[#F6F7F9] px-3 py-2 text-base text-black outline-none transition-colors duration-200 placeholder:text-gray220 hover:border-gray180 focus:border-orange-200 focus:bg-white"
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="gap-4 rounded-2xl p-5 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base font-medium">
              {t("order_page_comment_title")}
            </DialogTitle>
          </DialogHeader>

          {textarea}

          <DialogFooter className="mx-0 mb-0 flex-row border-t-0 bg-white p-0">
            <Button
              type="button"
              variant="outline"
              size="dialogAction"
              onClick={onClose}
            >
              {t("common_cancel")}
            </Button>
            <Button
              type="button"
              variant="primary-solid"
              size="dialogAction"
              onClick={handleSave}
            >
              {t("common_save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{t("order_page_comment_title")}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-2">{textarea}</div>

        <SheetFooter>
          <Button
            type="button"
            variant="primary-solid"
            size="primaryWide"
            onClick={handleSave}
          >
            {t("common_save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CommentDrawer;
