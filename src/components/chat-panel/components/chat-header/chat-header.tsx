"use client";

import { ChevronLeft, Headphones, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useGeneral } from "@/hooks/useGeneral";

type ChatHeaderProps = {
  onBack: () => void;
  // "close" (X) inside the desktop modal, "back" (‹) on the /chat page.
  backIcon?: "back" | "close";
};

// Support online status is presentational copy matching the design, not
// backend data — no presence/typing API is documented for chat.
const ChatHeader = ({ onBack, backIcon = "back" }: ChatHeaderProps) => {
  const t = useTranslations();
  const { data: general } = useGeneral();
  const phone = general?.data.business_phone;

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b border-gray180 bg-white pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-3">
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={onBack}
          aria-label={backIcon === "close" ? t("common_close") : t("common_back")}
          className="shrink-0 text-black"
        >
          {backIcon === "close" ? <X size={20} /> : <ChevronLeft size={22} />}
        </Button>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220">
          <Headphones size={19} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-black">
            {t("chat_header_title")}
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-gray220">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
            {t("chat_header_online")}
          </p>
        </div>

        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label={t("chat_header_call_aria")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220"
          >
            <Phone size={17} />
          </a>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
