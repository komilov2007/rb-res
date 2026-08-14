"use client";

import SearchModal from "@/components/modal/search-modal";
import { CloseButton } from "@/components/modal/modal-screen";
import Input from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useState } from "react";

interface SearchModalScreenProps {
  onClose: () => void;
}

const SearchModalScreen = ({ onClose }: SearchModalScreenProps) => {
  const t = useTranslations();
  const [search, setSearch] = useState("");

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <CloseButton onClose={onClose} />
        <Input
          autoFocus
          value={search}
          onChange={handleSearch}
          IconStart={SearchIcon}
          clearable
          onClear={() => setSearch("")}
          placeholder={t("search_products")}
          className="w-full"
        />
      </div>
      <SearchModal open value={search} fullscreen />
    </>
  );
};

export default SearchModalScreen;
