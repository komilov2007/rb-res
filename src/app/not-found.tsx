"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

const NotFoundContent = () => {
  const t = useTranslations();
  const { shopid } = useShopId();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray10 px-6 py-10">
      <div className="flex max-w-[360px] flex-col items-center text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-gray220">
          <SearchX size={36} strokeWidth={2} />
        </span>
        <h1 className="mt-5 text-2xl font-medium text-black">
          {t("page_not_found_title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray220">
          {t("page_not_found_description")}
        </p>
        {/* Keeps shop_id, so home opens the same restaurant. */}
        <Link
          href={`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`}
          className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium"
        >
          <span className="flex items-center gap-2 text-white">
            <ArrowLeft size={16} />
            {t("page_not_found_back")}
          </span>
        </Link>
      </div>
    </main>
  );
};

// Unmatched URLs (and notFound() calls) — the app's own 404 instead of
// Next's default English one. useSearchParams (shop_id) needs Suspense.
const NotFound = () => (
  <Suspense>
    <NotFoundContent />
  </Suspense>
);

export default NotFound;
