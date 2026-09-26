"use client";

import { CalendarCheck, Hand, X } from "lucide-react";
import {
  IconClipboardListFilled,
  IconMessageCircleFilled,
  IconSparklesFilled,
} from "@tabler/icons-react";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useOrdersPreview } from "@/components/header/components/orders-preview";
import { useActiveOrdersCount } from "@/hooks/useActiveOrdersCount";
import { getProfileOrdersUrl } from "@/utils/orders";
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
    Icon: IconMessageCircleFilled,
  },
  {
    key: "booking",
    label: "booking_title",
    Icon: CalendarCheck,
  },
  {
    key: "atmosphere",
    label: "atmosphere_title",
    Icon: IconSparklesFilled,
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
  // TEMPORARY — orders-preview variant 22: desktop-only "Buyurtmalarim"
  // action plus an active-orders counter on the main button. Mobile keeps
  // its bottom-nav "Buyurtmalarim", so both are `lg:` only.
  const { showHandAction } = useOrdersPreview();
  const activeOrdersCount = useActiveOrdersCount();
  const visibleActions = showHandAction
    ? [
        ...actions,
        {
          key: "orders",
          label: "order",
          Icon: IconClipboardListFilled,
          desktopOnly: true,
        },
      ]
    : actions;
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

    if (key === "orders") {
      action.setFalse();
      router.push(getProfileOrdersUrl(shopid));
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
                ? "pointer-events-auto max-h-80"
                : "pointer-events-none max-h-0"
            }`}
          >
            {visibleActions.map(({ key, label, Icon, ...rest }, index) => (
              <Button
                key={key}
                type="button"
                variant="plain"
                size="none"
                onClick={() => handleActionClick(key)}
                className={`h-13 gap-2 rounded-full border border-white/60 bg-white/70 py-0.5 pl-4 pr-1 text-sm font-medium text-black backdrop-blur-md transition-all duration-500 ease-out ${
                  "desktopOnly" in rest ? "hidden lg:flex" : ""
                } ${
                  action.value
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-6 scale-90 opacity-0"
                }`}
                style={{
                  transitionDelay: action.value
                    ? `${index * 70}ms`
                    : `${(visibleActions.length - index - 1) * 45}ms`,
                }}
              >
                <span>{t(label)}</span>
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                  <Icon size={20} />
                  {key === "orders" && activeOrdersCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none text-white ring-2 ring-white">
                      {activeOrdersCount}
                    </span>
                  )}
                </span>
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant={action.value ? "plain" : "primary-solid"}
            size="icon"
            onClick={action.toggle}
            className={`pointer-events-auto relative h-14 w-14 rounded-full transition-all duration-300 active:scale-95 ${
              action.value
                ? "rotate-90 border border-white/60 bg-white/70 text-black backdrop-blur-md"
                : "rotate-0"
            }`}
          >
            <MainIcon
              size={24}
              className="transition-transform duration-300"
            />
            {showHandAction && !action.value && activeOrdersCount > 0 && (
              <span className="absolute -right-1 -top-1 hidden h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-medium leading-none text-primary ring-2 ring-primary lg:flex">
                {activeOrdersCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileAction;

