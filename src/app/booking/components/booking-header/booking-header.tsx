"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";

const BookingHeader = () => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 shrink-0 rounded-b-2xl border-b border-gray180 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-4">
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={() => router.back()}
          aria-label={t("common_back")}
          className="shrink-0 text-black"
        >
          <ChevronLeft size={22} />
        </Button>
        <h1 className="min-w-0 truncate text-base font-medium text-black">
          {t("booking_title")}
        </h1>
      </div>
    </div>
  );
};

export default BookingHeader;
