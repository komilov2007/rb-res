"use client";

import { type ChangeEvent, useRef } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import SearchModal from "@/components/modal/search-modal";
import { useProductDetailStore } from "@/stores/product-detail";
import type { useBoolean } from "@/hooks/useBoolean";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

type HeaderSearchProps = {
  modal: ReturnType<typeof useBoolean>;
  value: string;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
};

// Desktop header search: the collapsed icon button that swaps in place for
// an inline input, with the results popover below it.
const HeaderSearch = ({
  modal,
  value,
  handleSearch,
  handleClearSearch,
}: HeaderSearchProps) => {
  const t = useTranslations();
  // Clicks in the inline input are "outside" the results popover — they
  // must not close it.
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  // modal = the inline input is open. The results only open once there is
  // something typed.
  const isResultsOpen = modal.value && value.trim() !== "";

  return (
    /* Collapsed search: the icon button. Clicking it swaps the
        button in place for a wide input (autofocused, sliding open
        from the right). The results open below it only after the
        user types; an empty input closes on blur or Escape. */
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
          <span className="title20 font-medium text-black">{t("search")}</span>
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
  );
};

export default HeaderSearch;
