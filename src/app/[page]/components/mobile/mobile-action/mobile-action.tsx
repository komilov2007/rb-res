"use client";

import {
  CalendarCheck,
  Hand,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useBoolean } from "@/hooks/useBoolean";
import { useOpenBooking } from "@/hooks/useOpenBooking";
import { useOpenChat } from "@/hooks/useOpenChat";
import { useShopId } from "@/hooks/useShopId";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";
import { useUiStore } from "@/stores/ui";
import { useProductDetailStore } from "@/stores/product-detail";

// `label` holds a translation key, resolved with t() at render.
const actions = [
  {
    key: "chat",
    label: "home_mobile_action_chat",
    Icon: MessageCircle,
  },
  {
    key: "booking",
    label: "booking_title",
    Icon: CalendarCheck,
  },
  {
    key: "atmosphere",
    label: "atmosphere_title",
    Icon: Sparkles,
  },
];

const MobileAction = () => {
  const t = useTranslations();
  const action = useBoolean();
  const router = useRouter();
  const pathname = usePathname();
  const { shopid } = useShopId();
  const cartCount = useCartStore((state) => state.cartCount);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const isDiscountDrawerOpen = useUiStore(
    (state) => state.isDiscountDrawerOpen,
  );
  const isMobileHeaderDrawerOpen = useUiStore(
    (state) => state.isMobileHeaderDrawerOpen,
  );
  const isProductDetailOpen = useProductDetailStore((state) => state.isOpen);
  const locationModal = useLocationStore((state) => state.locationModal);
  const selectionModal = useBranchSelectionStore(
    (state) => state.selectionModal,
  );
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const openChat = useOpenChat();
  const openBooking = useOpenBooking();
  const MainIcon = action.value ? X : Hand;
  const hasCart = cartCount > 0;
  const isCartPage = pathname.includes("/cart");

  const handleActionClick = (key: string) => {
    if (key === "booking") {
      action.setFalse();
      openBooking();
      return;
    }

    if (key === "chat") {
      action.setFalse();
      openChat();
    }

    if (key === "atmosphere") {
      action.setFalse();
      router.push(`${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`);
    }
  };

  if (
    isCartPage ||
    isCartOpen ||
    isDiscountDrawerOpen ||
    isMobileHeaderDrawerOpen ||
    isProductDetailOpen ||
    locationModal ||
    // Same visibility rule as BranchSelectionModal (shown only when logged in).
    (selectionModal && hasAccess)
  )
    return null;

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[60] bg-black/10 transition-opacity duration-200 supports-backdrop-filter:backdrop-blur-xs ${
          action.value ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        data-mobile-action-widget
        className={`pointer-events-none fixed bottom-[96px] right-4 z-[70] w-fit max-w-[calc(100vw-2rem)] lg:right-8 ${
          hasCart ? "lg:bottom-32" : "lg:bottom-8"
        }`}
      >
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex origin-bottom-right flex-col items-end gap-2 overflow-hidden transition-all duration-500 ease-out ${
              action.value
                ? "pointer-events-auto max-h-60"
                : "pointer-events-none max-h-0"
            }`}
          >
            {actions.map(({ key, label, Icon }, index) => (
              <Button
                key={key}
                type="button"
                variant="plain"
                size="none"
                onClick={() => handleActionClick(key)}
                className={`h-13 gap-2 rounded-full border border-white/60 bg-white/70 py-0.5 pl-4 pr-1 text-sm font-medium text-black backdrop-blur-md transition-all duration-500 ease-out ${
                  action.value
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-6 scale-90 opacity-0"
                }`}
                style={{
                  transitionDelay: action.value
                    ? `${index * 70}ms`
                    : `${(actions.length - index - 1) * 45}ms`,
                }}
              >
                <span>{t(label)}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                  <Icon size={20} />
                </span>
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant={action.value ? "plain" : "primary-solid"}
            size="icon"
            onClick={action.toggle}
            className={`pointer-events-auto h-14 w-14 rounded-full transition-all duration-300 active:scale-95 ${
              action.value
                ? "rotate-90 border border-white/60 bg-white/70 text-black backdrop-blur-md"
                : "rotate-0"
            }`}
          >
            <MainIcon
              size={24}
              className="transition-transform duration-300"
            />
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileAction;

