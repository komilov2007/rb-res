"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useCartStore } from "@/stores/cart";
import { useBoolean } from "@/hooks/useBoolean";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { getSearchUrl } from "@/utils/search";

// Header state: search input synced to ?search= and the opt-in pinned-row
// scroll flag.
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

  // Only listens when actually pinned (pages that don't opt in never pay for
  // this). Once scrolled, the seam against the breadcrumb/topbar it left
  // behind needs a border back so it doesn't look glued to whatever's now
  // sitting right below it.
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
