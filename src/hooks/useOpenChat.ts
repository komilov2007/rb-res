"use client";

import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

// Opens support chat the right way for the screen: the ChatModal on
// desktop, the /chat page on mobile. Logged-out users get the login modal
// first, same as the floating Hand menu's chat action.
export const useOpenChat = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const setChatModalOpen = useUiStore((state) => state.setChatModalOpen);

  return () => {
    if (!hasAccess) {
      setLoginModal(true);
      return;
    }

    if (isDesktop) {
      setChatModalOpen(true);
      return;
    }

    router.push(`${ROUTER.CHAT}${shopid ? `?shop_id=${shopid}` : ""}`);
  };
};
