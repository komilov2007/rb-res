"use client";

import Location from "../location";
import Logo from "@/components/logo";
import Input from "@/components/ui/input";
import Language from "@/components/language";
import { useBoolean } from "@/hooks/useBoolean";
import { createQueryString } from "@/utils/search";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, ShoppingCart, User } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import SearchModal from "@/components/modal/search-modal";
import { useCartStore } from "@/store/cart";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [value, setValue] = useState(search ?? "");
  const modal = useBoolean();
  const cartCount = useCartStore((state) => state.cartCount);

  const getSearchUrl = (search: string) => {
    const query = createQueryString([["search", search]], searchParams);
    return query ? `${pathname}?${query}` : pathname;
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    router.push(getSearchUrl(newValue));
  };

  const handleClearSearch = () => {
    setValue("");
    router.push(getSearchUrl(""));
  };

  return (
    <>
      <header className="fixed left-0 top-0 z-50 hidden w-full border-b border-gray180 bg-white py-4 lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-8 px-5">
          <div className="flex w-[180px] shrink-0 items-center">
            <Logo />
          </div>

          <div className="flex flex-1 justify-center">
            <Popover open={modal.value} onOpenChange={modal.toggle}>
              <PopoverTrigger className="w-full max-w-[430px]">
                <Input
                  readOnly
                  value={value}
                  IconStart={SearchIcon}
                  clearable
                  onClear={handleClearSearch}
                  placeholder="Mahsulotni qidirish"
                  className="w-full"
                />
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                sideOffset={-44}
                className="flex w-[var(--radix-popover-trigger-width)] flex-col gap-2 p-0"
              >
                <Input
                  autoFocus
                  value={value}
                  onChange={handleSearch}
                  IconStart={SearchIcon}
                  clearable
                  onClear={handleClearSearch}
                  placeholder="Mahsulotni qidirish"
                  className="w-full"
                />
                <SearchModal open={modal.value} value={value} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex w-[420px] shrink-0 items-center justify-end gap-8">
            <Language />
            <Location />
            <button className="relative flex items-center gap-2">
              <span className="relative">
                <ShoppingCart size={20} className="text-gray220" />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
                    {cartCount}
                  </span>
                )}
              </span>

              <span className="text-sm font-semibold text-black">Savatcha</span>
            </button>
            <button className="flex items-center gap-2">
              <User size={20} className="text-black" />
              <span className="text-sm font-semibold text-black">Kirish</span>
            </button>
          </div>
        </div>
      </header>

      <div className="hidden h-[73px] lg:block" />
    </>
  );
};

export default Header;
