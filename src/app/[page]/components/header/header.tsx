"use client";

import { type ChangeEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, ShoppingCart, User } from "lucide-react";
import { useTranslations } from "next-intl";

import Logo from "@/components/logo";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Language from "@/components/language";
import SearchModal from "@/components/modal/search-modal";
import Location from "@/app/[page]/components/location";

import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

import { useBoolean } from "@/hooks/useBoolean";
import { useGeneral } from "@/hooks/useGeneral";

import { getSearchUrl } from "@/utils/search";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { data: general } = useGeneral();
  const modal = useBoolean();
  const search = searchParams.get("search");
  const [value, setValue] = useState(search ?? "");
  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const setProfileModal = useAuthStore((state) => state.setProfileModal);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setValue(newValue);

    router.push(
      getSearchUrl({
        pathname,
        search: newValue,
        searchParams,
      }),
    );
  };

  const handleClearSearch = () => {
    setValue("");

    router.push(
      getSearchUrl({
        pathname,
        search: "",
        searchParams,
      }),
    );
  };

  return (
    <>
      <header className="fixed left-0 top-0 z-50 hidden h-[98px] w-full border-b border-gray180 bg-white lg:flex">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-5">
          {general?.data.logo && (
            <div className="flex w-[120px] shrink-0 items-center">
              <Logo />
            </div>
          )}

          <div className="min-w-[280px] flex-1">
            <Popover open={modal.value} onOpenChange={modal.toggle}>
              <PopoverTrigger className="w-full rounded-2xl outline-none">
                <Input
                  readOnly
                  value={value}
                  IconStart={SearchIcon}
                  clearable
                  onClear={handleClearSearch}
                  placeholder={t("search_food_or_category")}
                  className="w-full font-medium"
                />
              </PopoverTrigger>

              <PopoverContent
                side="top"
                align="end"
                sideOffset={-54}
                className="flex w-[var(--radix-popover-trigger-width)] flex-col gap-2 p-0"
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
            <Location />
            <span className="mx-4 h-8 w-px bg-gray180" />
            <Language />
            <span className="mx-4 h-8 w-px bg-gray180" />
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
              <span className="title20 text-black">{t("cart")}</span>
            </Button>
            <span className="mx-4 h-8 w-px bg-gray180" />
            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 px-3"
              onClick={hasAccess ? setProfileModal(true) : setLoginModal(true)}
            >
              <User size={21} />
              <span className="title20 text-black">{t("profile")}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="hidden h-[98px] lg:block" />
    </>
  );
};

export default Header;
