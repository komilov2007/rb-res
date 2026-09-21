"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";
import { useCartStore } from "@/stores/cart";
import { useBoolean } from "@/hooks/useBoolean";
import { useBranches } from "@/hooks/useBranches";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { getSearchUrl } from "@/utils/search";

// Header state: search input synced to ?search=, the desktop branch
// dialog's map + selected branch, and the opt-in pinned-row scroll flag.
export const useHeader = (pinBottomRow: boolean) => {
  const [isPinned, setIsPinned] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: general } = useGeneral();
  const { shopid } = useShopId();
  const { data: branches } = useBranches();
  const modal = useBoolean();
  const search = searchParams.get("search");
  const [value, setValue] = useState(search ?? "");
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchProps | null>(
    null,
  );
  const branchMapRef = useRef<BranchMapInstance | null>(null);
  const branchMapApiRef = useRef<BranchYMapsApi | null>(null);
  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);

  const renderBranchPlacemark = useCallback((branch: BranchProps | null) => {
    if (!branch || !branchMapRef.current || !branchMapApiRef.current) {
      return;
    }

    const placemark = new branchMapApiRef.current.Placemark(
      [branch.longitude, branch.latitude],
      {
        balloonContentHeader: branch.name,
        balloonContentBody: branch.address,
      },
      {
        preset: "islands#redIcon",
      },
    );

    branchMapRef.current.geoObjects.removeAll();
    branchMapRef.current.geoObjects.add(placemark);
  }, []);

  useEffect(() => {
    renderBranchPlacemark(selectedBranch);
  }, [renderBranchPlacemark, selectedBranch]);

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
    branches,
    modal,
    value,
    branchesOpen,
    setBranchesOpen,
    selectedBranch,
    setSelectedBranch,
    branchMapRef,
    branchMapApiRef,
    cartCount,
    openCartModal,
    renderBranchPlacemark,
    handleSearch,
    handleClearSearch,
  };
};
