"use client";

import { SearchIcon, ShoppingCart, User } from "lucide-react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import SearchModal from "@/components/modal/search-modal";
import Location from "@/app/[page]/components/location";
import { BranchDialog, HeaderTopbar } from "./components";
import { useHeader } from "./useHeader";

import { openBranchDirections } from "@/utils/directions";
import { useProductDetailStore } from "@/stores/product-detail";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type HeaderProps = {
  // Opt-in only — omitted everywhere except the category pages that asked
  // for it, so every other route keeps this component's exact prior
  // behavior (plain, non-sticky, bottom-bordered). Pins just the bottom
  // logo/search/cart row; the phone/branches/language row above it still
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
    branches,
    modal,
    value,
    branchesOpen,
    setBranchesOpen,
    selectedBranch,
    setSelectedBranch,
    branchMapRef,
    branchMapApiRef,
    cartCount,
    openCartModal,
    renderBranchPlacemark,
    handleSearch,
    handleClearSearch,
  } = useHeader(pinBottomRow);

  return (
    <>
      <HeaderTopbar
        phone={general?.data.business_phone}
        branches={branches?.data}
        branchesOpen={branchesOpen}
        onBranchesOpenChange={setBranchesOpen}
        onSelectBranch={(branch) => {
          setSelectedBranch(branch);
          setBranchesOpen(false);
        }}
      />
      <header
        className={`relative left-0 top-0 z-50 hidden h-[93px] w-full border-b border-gray180 bg-white lg:flex ${
          pinBottomRow
            ? isPinned
              ? "lg:sticky lg:shadow-[0_4px_14px_rgba(17,24,39,0.08)]"
              : "lg:sticky lg:border-b-0"
            : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-5">
          {general?.data.logo && (
            <div className="flex w-[120px] shrink-0 items-center">
              <Logo />
            </div>
          )}

          <Location className="w-48 shrink-0" />

          <div className="ml-auto w-full min-w-70 max-w-lg flex-1">
            <Popover open={modal.value} onOpenChange={modal.toggle}>
              {/* asChild + a plain div (not the default Trigger <button>) —
                  Input's own clear button is a real <button>, and a <button>
                  can't nest inside another <button> without a hydration
                  error. */}
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.currentTarget.click();
                    }
                  }}
                  className="w-full rounded-2xl outline-none"
                >
                  <Input
                    readOnly
                    value={value}
                    IconStart={SearchIcon}
                    clearable
                    onClear={handleClearSearch}
                    placeholder={t("search_food_or_category")}
                    className="w-full font-medium"
                  />
                </div>
              </PopoverTrigger>

              <PopoverContent
                side="top"
                align="end"
                sideOffset={-54}
                className="flex w-[var(--radix-popover-trigger-width)] flex-col gap-2 p-0"
                // A result opens the product-detail Dialog on top of this
                // popover — clicks/focus inside that Dialog count as
                // "outside" here, so dismissal is skipped while it's open
                // and the results are still there once it closes.
                onInteractOutside={(event) => {
                  if (useProductDetailStore.getState().isOpen) {
                    event.preventDefault();
                  }
                }}
              >
                <Input
                  autoFocus
                  value={value}
                  onChange={handleSearch}
                  IconStart={SearchIcon}
                  clearable
                  onClear={handleClearSearch}
                  placeholder={t("search_food_or_category")}
                  className="w-full font-medium"
                />

                <SearchModal open={modal.value} value={value} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => openCartModal("desktop")}
              className="flex-col gap-1 px-3"
            >
              <span className="relative">
                <ShoppingCart size={21} />
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="title20 font-medium text-black">{t("cart")}</span>
            </Button>
            <span className="mx-4 h-8 w-px bg-gray180" />
            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 px-3"
              onClick={() => router.push(`/profile${shopid ? `?shop_id=${shopid}` : ""}`)}
            >
              <User size={21} />
              <span className="title20 font-medium text-black">{t("profile")}</span>
            </Button>
          </div>
        </div>
      </header>
      <BranchDialog
        branch={selectedBranch}
        branchMapRef={branchMapRef}
        branchMapApiRef={branchMapApiRef}
        onClose={() => setSelectedBranch(null)}
        onOpenDirections={openBranchDirections}
        renderBranchPlacemark={renderBranchPlacemark}
      />
    </>
  );
};

export default Header;

