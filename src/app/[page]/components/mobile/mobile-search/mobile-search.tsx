"use client";

import { type ChangeEvent, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import SearchModal from "@/components/modal/search-modal";
import Input from "@/components/ui/input";
import XButton from "@/components/ui/x-button";
import { useBoolean } from "@/hooks/useBoolean";

const MobileSearch = () => {
  const t = useTranslations();
  const modal = useBoolean();
  const [value, setValue] = useState("");

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClear = () => {
    setValue("");
  };

  return (
    <>
      <div className="sticky top-0 z-40 mt-3 -mx-3 border-b border-transparent bg-white/95 px-3 py-2 transition-all duration-300 supports-[backdrop-filter]:bg-white/85 supports-[backdrop-filter]:backdrop-blur-md">
        <button
          type="button"
          onClick={modal.setTrue}
          className="flex h-12 w-full min-w-0 items-center gap-3 rounded-2xl bg-gray10 px-4 text-left transition-colors active:bg-gray180"
        >
          <SearchIcon size={19} className="shrink-0 text-gray220" />
          <span className="truncate text-sm font-semibold text-gray220">
            {t("search_food_or_category")}
          </span>
        </button>
      </div>

      {modal.value && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <div className="flex items-center gap-2 px-4 py-3">
            <XButton size="lg" onClick={modal.setFalse} />
            <Input
              autoFocus
              value={value}
              onChange={handleSearch}
              IconStart={SearchIcon}
              clearable
              onClear={handleClear}
              placeholder={t("search_food_or_category")}
              wrapperClassName="h-12 rounded-2xl bg-gray10"
            />
          </div>
          <SearchModal open={modal.value} value={value} fullscreen />
        </div>
      )}
    </>
  );
};

export default MobileSearch;
