"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import SearchModal from "@/components/modal/search-modal";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import { useBoolean } from "@/hooks/useBoolean";

type MobileFixedHeaderProps = {
  shopName: string;
};

const MobileFixedHeader = ({ shopName }: MobileFixedHeaderProps) => {
  const t = useTranslations();
  const modal = useBoolean();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 260);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClear = () => {
    setValue("");
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray180 bg-white px-4 transition-all duration-300 lg:hidden ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <h2 className="line-clamp-1 px-3 text-center text-lg font-extrabold text-black">
          {shopName}
        </h2>

        <Button
          variant="plain"
          size="icon"
          className="text-black"
          onClick={modal.setTrue}
        >
          <SearchIcon size={24} />
        </Button>
      </header>

      {modal.value && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden">
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

export default MobileFixedHeader;
