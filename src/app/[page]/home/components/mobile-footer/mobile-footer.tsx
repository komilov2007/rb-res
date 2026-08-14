"use client";

import { Grid3X3, Home, Search, User } from "lucide-react";
import { useModalStore } from "@/store/modal";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";

const MobileFooter = () => {
  const t = useTranslations();
  const openModal = useModalStore((state) => state.openModal);
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollCategories = () => {
    document
      .querySelector("[data-categories]")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray180 bg-white px-4 pb-3 pt-2 lg:hidden">
      <ul className="grid grid-cols-4 items-center">
        <li>
          <Button
            variant="nav"
            size="sm"
            onClick={scrollTop}
            className="h-auto w-full flex-col gap-1 rounded-none p-0 text-primary hover:bg-transparent"
          >
            <Home size={21} />
            <span className="text-[11px] font-semibold">{t("home")}</span>
          </Button>
        </li>
        <li>
          <Button
            variant="nav"
            size="sm"
            onClick={() => openModal("search")}
            className="h-auto w-full flex-col gap-1 rounded-none p-0 hover:bg-transparent"
          >
            <Search size={21} />
            <span className="text-[11px] font-semibold">{t("search")}</span>
          </Button>
        </li>
        <li>
          <Button
            variant="nav"
            size="sm"
            onClick={scrollCategories}
            className="h-auto w-full flex-col gap-1 rounded-none p-0 hover:bg-transparent"
          >
            <Grid3X3 size={21} />
            <span className="text-[11px] font-semibold">{t("category")}</span>
          </Button>
        </li>
        <li>
          <Button
            variant="nav"
            size="sm"
            className="h-auto w-full flex-col gap-1 rounded-none p-0 hover:bg-transparent"
          >
            <User size={21} />
            <span className="text-[11px] font-semibold">{t("profile")}</span>
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default MobileFooter;
