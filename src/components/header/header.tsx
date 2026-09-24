"use client";

import { useRef } from "react";
import { ChevronRight, SearchIcon } from "lucide-react";
import {
  IconClipboardListFilled,
  IconShoppingCartFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import SearchModal from "@/components/modal/search-modal";
import Location from "@/components/location";
import { HeaderTopbar } from "./components";
import { useHeader } from "./useHeader";

import { useProductDetailStore } from "@/stores/product-detail";
import { useActiveOrdersCount } from "@/hooks/useActiveOrdersCount";
import { getProfileOrdersUrl } from "@/utils/orders";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

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
  // Clicks in the inline input are "outside" the results popover — they
  // must not close it.
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  // modal = the inline input is open. The results only open once there is
  // something typed.
  const isResultsOpen = modal.value && value.trim() !== "";

  return (
    <>
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
            <span className="h-8 w-px shrink-0 bg-gray180" />
            {/* Desktop "Buyurtmalarim" lives in the profile (guests get its
                login prompt there). */}
            <button
              type="button"
              onClick={() => router.push(getProfileOrdersUrl(shopid))}
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
                      ? t("header_orders_active", { count: activeOrdersCount })
                      : t("header_orders_view")}
                  </span>
                  <ChevronRight
                    size={15}
                    className="shrink-0 text-gray220 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </span>
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center">
            {/* Collapsed search: the icon button. Clicking it swaps the
                button in place for a wide input (autofocused, sliding open
                from the right). The results open below it only after the
                user types; an empty input closes on blur or Escape. */}
            <Popover
              open={isResultsOpen}
              onOpenChange={(open) => {
                if (!open) modal.setFalse();
              }}
            >
              {modal.value ? (
                <PopoverAnchor asChild>
                  <div
                    ref={searchAnchorRef}
                    className="mr-3 w-[min(32rem,40vw)] animate-in fade-in slide-in-from-right-4 duration-200"
                  >
                    <Input
                      autoFocus
                      value={value}
                      onChange={handleSearch}
                      onBlur={() => {
                        if (!value.trim()) modal.setFalse();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") modal.setFalse();
                      }}
                      IconStart={SearchIcon}
                      clearable
                      onClear={handleClearSearch}
                      placeholder={t("search_food_or_category")}
                      className="w-full font-normal"
                    />
                  </div>
                </PopoverAnchor>
              ) : (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={modal.setTrue}
                  className="flex-col gap-1 px-2.5"
                >
                  <span className="relative">
                    <SearchIcon size={21} />
                    {/* An active ?search= stays visible while collapsed. */}
                    {value && (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
                    )}
                  </span>
                  <span className="title20 font-medium text-black">
                    {t("search")}
                  </span>
                </Button>
              )}

              <PopoverContent
                side="bottom"
                align="end"
                sideOffset={8}
                // Keep focus in the input instead of moving it into the list.
                onOpenAutoFocus={(event) => event.preventDefault()}
                className="w-[var(--radix-popover-trigger-width)] border-transparent bg-transparent p-0"
                onInteractOutside={(event) => {
                  const target = event.target as Node | null;

                  // Typing/clicking in the inline input keeps it open, and
                  // a result opens the product-detail Dialog on top of this
                  // popover — dismissal is skipped while it's open so the
                  // results are still there once it closes.
                  if (
                    (target && searchAnchorRef.current?.contains(target)) ||
                    useProductDetailStore.getState().isOpen
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <SearchModal open={isResultsOpen} value={value} />
              </PopoverContent>
            </Popover>
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
              onClick={() =>
                router.push(`/profile${shopid ? `?shop_id=${shopid}` : ""}`)
              }
            >
              <IconUserFilled size={21} />
              <span className="title20 font-medium text-black">
                {t("profile")}
              </span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
