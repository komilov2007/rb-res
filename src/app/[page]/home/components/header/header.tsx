"use client";

import Location from "../location";
import Logo from "@/components/logo";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
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
import { useTranslations } from "next-intl";
import { formatPrice } from "@/utils/format-price";
import { useGeneral } from "@/hooks/useGeneral";

const Header = () => {
  const router = useRouter();
  const t = useTranslations();
  const { data: general } = useGeneral();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [value, setValue] = useState(search ?? "");
  const modal = useBoolean();
  const cartCount = useCartStore((state) => state.cartCount);
  const carts = useCartStore((state) => state.carts);
  const cartTotal = carts.reduce((total, item) => {
    const price = item.product.discount_price ?? item.product.price;

    return total + price * item.quantity;
  }, 0);

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
                  placeholder="Taom yoki kategoriya qidiring..."
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
                  placeholder="Taom yoki kategoriya qidiring..."
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
            <Button variant="ghost" size="lg" className="group relative px-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gray10 text-black transition-colors duration-200 group-hover:bg-white">
                <ShoppingCart size={20} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </span>

              <span className="flex flex-col items-start">
                <span className="text-[13px] font-semibold leading-none text-black">
                  {t("cart")}
                </span>
                <span className="mt-1 text-xs font-semibold leading-none text-gray220">
                  {formatPrice(cartTotal)} {t("sum")}
                </span>
              </span>
            </Button>
            <span className="mx-4 h-8 w-px bg-gray180" />
            <Button variant="icon" size="icon">
              <User size={21} />
            </Button>
          </div>
        </div>
      </header>

      <div className="hidden h-[98px] lg:block" />
    </>
  );
};

export default Header;
