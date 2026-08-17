"use client";

import SearchModal from "@/components/modal/search-modal";
import ModalScreen from "@/components/modal/modal-screen";
import { CloseButton } from "@/components/modal/modal-screen";
import Input from "@/components/ui/input";
import { useModalStore } from "@/store/modal";
import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useState } from "react";

const HomeModals = () => {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const activeModal = useModalStore((state) => state.activeModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  if (!activeModal) return null;

  return (
    <ModalScreen onClose={closeModal}>
      <div className="flex items-center gap-3">
        <CloseButton onClose={closeModal} />
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
    </ModalScreen>
  );
};

export default HomeModals;
