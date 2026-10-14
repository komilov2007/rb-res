"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useAtmosphere } from "@/hooks/useAtmosphere";
import { useShopId } from "@/hooks/useShopId";
import { getAtmosphereMedia } from "@/utils/atmosphere";

export const usePage = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const { atmosphere, isLoading, isError, isNotFound, refetch } =
    useAtmosphere();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isNotFound) return;

    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  }, [isNotFound, router, shopid]);

  return {
    atmosphere,
    content: atmosphere ? getAtmosphereMedia(atmosphere) : null,
    isLoading: isLoading || isNotFound,
    isError,
    refetch,
    viewerIndex,
    openViewer: setViewerIndex,
    closeViewer: () => setViewerIndex(null),
  };
};
