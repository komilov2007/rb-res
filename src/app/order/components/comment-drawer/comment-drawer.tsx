"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type CommentDrawerProps = {
  open: boolean;
  value: string | null;
  onClose: () => void;
  onSave: (value: string | null) => void;
};

// The parent remounts this via `key` on every open, so the draft always
// starts from the saved comment (same approach as recipient-drawer).
const CommentDrawer = ({ open, value, onClose, onSave }: CommentDrawerProps) => {
  const t = useTranslations();
  const [draft, setDraft] = useState(value ?? "");

  const handleSave = () => {
    onSave(draft.trim() || null);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{t("order_page.comment.title")}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-2">
          <textarea
            autoFocus
            rows={4}
            placeholder={t("order_page.comment.placeholder")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
            className="w-full resize-none rounded-xl border border-transparent bg-[#F6F7F9] px-3 py-2 text-base text-black outline-none transition-colors duration-200 placeholder:text-gray220 hover:border-gray180 focus:border-orange-200 focus:bg-white"
          />
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="primary-solid"
            size="primaryWide"
            onClick={handleSave}
          >
            {t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CommentDrawer;
