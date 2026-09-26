"use client";

import { ChevronRight } from "lucide-react";
import {
  IconClipboardListFilled,
  IconShoppingCartFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo";
import Button from "@/components/ui/button";
import Location from "@/components/location";
import { HeaderSearch, HeaderTopbar } from "./components";
import {
  OrdersFloatingExtras,
  OrdersTopStrip,
  OrdersPreviewSwitcher,
  useOrdersPreview,
} from "./components/orders-preview";
import { useHeader } from "./useHeader";

import { useActiveOrdersCount } from "@/hooks/useActiveOrdersCount";
import { getProfileOrdersUrl } from "@/utils/orders";

type HeaderProps = {
  // Opt-in only — omitted everywhere except the category pages that asked
  // for it, so every other route keeps this component's exact prior
  // behavior (plain, non-sticky, bottom-bordered). Pins just the bottom
  // logo/search/cart row; the phone/language row above it still
  // scrolls away normally.
  pinBottomRow?: boolean;
};

const Header = ({ pinBottomRow = false }: HeaderProps = {}) => {
  const t = useTranslations();
  const {
    isPinned,
    router,
    general,
    shopid,
    modal,
    value,
    cartCount,
    openCartModal,
    handleSearch,
    handleClearSearch,
  } = useHeader(pinBottomRow);
  // Same active-orders badge as the mobile bottom nav's "Buyurtmalarim".
  const activeOrdersCount = useActiveOrdersCount();
  // TEMPORARY — desktop placement preview (orders-preview).
  const preview = useOrdersPreview();
  const goToOrders = () => router.push(getProfileOrdersUrl(shopid));
  const goToProfile = () =>
    router.push(`/profile${shopid ? `?shop_id=${shopid}` : ""}`);
  const ordersBadge = activeOrdersCount > 0 && (
    <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-white ring-2 ring-white">
      {activeOrdersCount}
    </span>
  );

  return (
    <>
      <OrdersTopStrip />
      <HeaderTopbar phone={general?.data.business_phone} />
      <header
        className={`relative left-0 top-0 z-50 hidden h-16 w-full rounded-b-[30px] bg-white lg:flex ${
          pinBottomRow
            ? isPinned
              ? "lg:sticky lg:shadow-[0_4px_14px_rgba(17,24,39,0.08)]"
              : "lg:sticky"
            : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-5">
          {general?.data.logo && (
            <div className="flex w-[120px] shrink-0 items-center">
              <Logo />
            </div>
          )}

          {/* Address and "Buyurtmalarim" read as one group: the same
              two-line label/value style, split by a thin divider. On the
              left so the search opening on the right never pushes into it. */}
          <div className="flex min-w-0 items-center gap-4">
            <Location className="max-w-52 shrink-0" />
            {preview.showCurrent && (
              <>
                <span className="h-8 w-px shrink-0 bg-gray180" />
                {/* Desktop "Buyurtmalarim" lives in the profile (guests get its
                login prompt there). */}
                <button
                  type="button"
                  onClick={goToOrders}
                  className="group flex shrink-0 items-center gap-2.5 text-left"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary10 text-primary transition-colors group-hover:bg-primary/15">
                    <IconClipboardListFilled size={18} />
                  </span>
                  <span className="flex flex-col items-start">
                    <span className="text-xs font-normal leading-4 text-gray220">
                      {t("order")}
                    </span>
                    <span className="mt-0.5 flex items-center gap-0.5 text-sm font-medium leading-5">
                      <span
                        className={
                          activeOrdersCount > 0
                            ? "text-primary"
                            : "text-black transition-colors group-hover:text-primary"
                        }
                      >
                        {activeOrdersCount > 0
                          ? t("header_orders_active", {
                              count: activeOrdersCount,
                            })
                          : t("header_orders_view")}
                      </span>
                      <ChevronRight
                        size={15}
                        className="shrink-0 text-gray220 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center">
            <HeaderSearch
              modal={modal}
              value={value}
              handleSearch={handleSearch}
              handleClearSearch={handleClearSearch}
            />
            {preview.showHeaderIcon && (
              <>
                <span className="mx-1.5 h-7 w-px bg-gray180" />
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={goToOrders}
                  className="flex-col gap-1 px-2.5"
                >
                  <span className="relative">
                    <IconClipboardListFilled size={21} />
                    {ordersBadge}
                  </span>
                  <span className="title20 font-medium text-black">
                    {t("order")}
                  </span>
                </Button>
              </>
            )}
            <span className="mx-1.5 h-7 w-px bg-gray180" />
            <Button
              variant="ghost"
              size="lg"
              onClick={() => openCartModal("desktop")}
              className="flex-col gap-1 px-2.5"
            >
              <span className="relative">
                <IconShoppingCartFilled size={21} />
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="title20 font-medium text-black">
                {t("cart")}
              </span>
            </Button>
            <span className="mx-1.5 h-7 w-px bg-gray180" />
            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 px-2.5"
              onClick={goToProfile}
            >
              <span className="relative">
                <IconUserFilled size={21} />
                {preview.showProfileBadge && ordersBadge}
              </span>
              <span className="title20 font-medium text-black">
                {t("profile")}
              </span>
            </Button>
          </div>
        </div>
      </header>
      <OrdersFloatingExtras />
      <OrdersPreviewSwitcher />
    </>
  );
};

export default Header;
