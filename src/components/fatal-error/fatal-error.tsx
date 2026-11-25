"use client";

import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { closeTelegramWithError } from "@/utils/telegram";

export const FatalError = () => {
  const t = useTranslations();

  const handleClose = async () => {
    const closed = await closeTelegramWithError();

    if (!closed) window.location.reload();
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 pt-[calc(2.5rem+var(--safe-top))] pb-[calc(2.5rem+var(--safe-bottom))]">
      <div className="flex max-w-[340px] flex-col items-center text-center">
        <CircleAlert className="text-gray220" size={72} strokeWidth={2.2} />
        <h1 className="mt-2 text-2xl font-medium text-gray100">
          {t("shared_fatal_error_title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          {t("shared_fatal_error_description")}
        </p>
        <Button
          type="button"
          variant="primary-solid"
          className="mt-6 h-12 w-full"
          onClick={handleClose}
        >
          {t("shared_fatal_error_close")}
        </Button>
      </div>
    </main>
  );
};
