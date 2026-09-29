"use client";

import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";

// Opens /booking, asking logged-out users to log in first (the booking
// page itself needs the profile's name + phone). Shared by the floating
// Hand menu and the /atmosphere footer.
export const useOpenBooking = () => {
  const router = useRouter();
  const { shopid } = useShopId();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  return () => {
    if (!hasAccess) {
      setLoginModal(true);
      return;
    }

    router.push(`${ROUTER.BOOKING}${shopid ? `?shop_id=${shopid}` : ""}`);
  };
};
