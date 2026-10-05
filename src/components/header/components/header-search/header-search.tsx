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

const HeaderSearch = ({
  modal,
  value,
  handleSearch,
  handleClearSearch,
}: HeaderSearchProps) => {
  const t = useTranslations();
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  const isResultsOpen = modal.value && value.trim() !== "";

  return (
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
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-[var(--radix-popover-trigger-width)] border-transparent bg-transparent p-0"
        onInteractOutside={(event) => {
          const target = event.target as Node | null;

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
