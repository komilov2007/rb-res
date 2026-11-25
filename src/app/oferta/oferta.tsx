"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import Breadcrumb from "@/components/breadcrumb";
import PageLayout from "@/components/page-layout";
import Button from "@/components/ui/button";
import { getOferta } from "@/apis/oferta";
import { ROUTER } from "@/constants/router";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";
import type { LocaleProps } from "@/types/i18n";

import { OfertaText } from "./components/oferta-text";

const OfertaSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    <span className="skeleton mx-auto h-6 w-1/2 rounded-lg" />
    <span className="skeleton mx-auto h-5 w-2/3 rounded-lg" />
    {Array.from({ length: 10 }).map((_, index) => (
      <span key={index} className="skeleton h-4 w-full rounded-lg" />
    ))}
  </div>
);

const Oferta = () => {
  const t = useTranslations();
  const locale = useLocale() as LocaleProps;
  const router = useRouter();
  const { shopid } = useShopId();
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";

  const { data, isLoading, isError } = useQuery({
    queryKey: [REACT_QUERY_KEYS.OFERTA, shopid],
    queryFn: () => getOferta(shopid as string),
    enabled: Boolean(shopid),
  });

  return (
    <PageLayout>
      <div className="sticky top-0 z-30 rounded-b-2xl border-b border-gray180 bg-white pt-[var(--safe-top)] lg:hidden">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.push(`${ROUTER.HOME}${shopQuery}`)}
            aria-label={t("common_back")}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="min-w-0 flex-1 truncate text-base font-medium text-black">
            {t("oferta")}
          </h1>
        </div>
      </div>

      <Breadcrumb items={[{ label: t("oferta") }]} />

      <div className="mx-auto mt-2 w-full max-w-7xl rounded-2xl bg-white text-black lg:rounded-[30px]">
        {isLoading ? (
          <OfertaSkeleton />
        ) : data?.data ? (
          <OfertaText locale={locale} data={data.data} />
        ) : isError ? (
          <p className="py-10 text-center text-sm text-gray220">
            {t("oferta_not_found")}
          </p>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default Oferta;
