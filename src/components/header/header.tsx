"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { useBoolean } from "@/hooks/useBoolean";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { getSearchUrl } from "@/utils/search";
import { IconShoppingCartFilled, IconUserFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Logo from "@/components/logo";
import Button from "@/components/ui/button";
import Location from "@/components/location";
import { HeaderSearch, HeaderTopbar } from "@/components/header/components/index";
import ThemeSwitcher from "@/components/theme-switcher";
import { OrdersFloatingExtras } from "@/components/header/components/orders-preview/index";

export const useHeader = (pinBottomRow: boolean) => {
  const [isPinned, setIsPinned] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: general } = useGeneral();
  const { shopid } = useShopId();
  const modal = useBoolean();
  const search = searchParams.get("search");
  const [value, setValue] = useState(search ?? "");
  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);

  useEffect(() => {
    if (!pinBottomRow) return;

    const handleScroll = () => setIsPinned(window.scrollY > 4);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pinBottomRow]);

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

  return {
    isPinned,
    router,
    general,
    shopid,
    modal,
    value,
    cartCount,
    openCartModal,
    handleSearch,
    handleClearSearch,
  };
};

type HeaderProps = {
  pinBottomRow?: boolean;
};

const Header = ({ pinBottomRow = false }: HeaderProps = {}) => {
  const t = useTranslations();
  const {
    isPinned,
    router,
    general,
    shopid,
    modal,
    value,
    cartCount,
    openCartModal,
    handleSearch,
    handleClearSearch,
  } = useHeader(pinBottomRow);
  const goToProfile = () =>
    router.push(`/profile${shopid ? `?shop_id=${shopid}` : ""}`);

  return (
    <>
      <HeaderTopbar />
      <header
        className={`relative left-0 top-0 z-50 hidden h-16 w-full rounded-b-[30px] bg-white lg:flex ${
          pinBottomRow
            ? isPinned
              ? "lg:sticky lg:shadow-[0_4px_14px_rgba(17,24,39,0.08)]"
              : "lg:sticky"
            : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-5">
          {general?.data.logo && (
            <div className="flex w-[120px] shrink-0 items-center">
              <Logo />
            </div>
          )}

          <div className="flex min-w-0 items-center gap-4">
            <Location className="max-w-52 shrink-0" />
          </div>

          <div className="ml-auto flex shrink-0 items-center">
            <HeaderSearch
              modal={modal}
              value={value}
              handleSearch={handleSearch}
              handleClearSearch={handleClearSearch}
            />
            <span className="mx-1.5 h-7 w-px bg-gray180" />
            <Button
              variant="ghost"
              size="lg"
              onClick={() => openCartModal("desktop")}
              className="flex-col gap-1 px-2.5"
            >
              <span className="relative">
                <IconShoppingCartFilled size={21} />
                {cartCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="title20 font-medium text-black">
                {t("cart")}
              </span>
            </Button>
            <span className="mx-1.5 h-7 w-px bg-gray180" />
            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 px-2.5"
              onClick={goToProfile}
            >
              <span className="relative">
                <IconUserFilled size={21} />
              </span>
              <span className="title20 font-medium text-black">
                {t("profile")}
              </span>
            </Button>
          </div>
        </div>
      </header>
      <OrdersFloatingExtras />
      <ThemeSwitcher />
    </>
  );
};

export { Header };

export default Header;
