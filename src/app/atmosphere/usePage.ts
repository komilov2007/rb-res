"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useAtmosphere } from "@/hooks/useAtmosphere";
import { useShopId } from "@/hooks/useShopId";
import { getAtmosphereMedia, getAtmosphereTabs } from "@/utils/atmosphere";

export const usePage = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const { atmosphere, isLoading, isError, isNotFound, refetch } =
    useAtmosphere();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (!isNotFound) return;

    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  }, [isNotFound, router, shopid]);

  const media = atmosphere ? getAtmosphereMedia(atmosphere) : null;
  const tabs = media ? getAtmosphereTabs(media.sections) : [];
  const content =
    media && activeTab
      ? {
          ...media,
          sections: media.sections.filter(
            (section) => section.key === activeTab,
          ),
        }
      : media;

  return {
    atmosphere,
    content,
    tabs,
    activeTab,
    setActiveTab,
    isLoading: isLoading || isNotFound,
    isError,
    refetch,
    viewerIndex,
    openViewer: setViewerIndex,
    closeViewer: () => setViewerIndex(null),
  };
};
