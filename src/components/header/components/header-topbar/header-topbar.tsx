"use client";

import Language from "@/components/language";
import { useIsClick } from "@/hooks/useIsClick";

const HeaderTopbar = () => {
  const isClickApp = useIsClick();

  if (isClickApp) return null;

  return (
    <div className="relative left-0 top-0 z-50 hidden h-9 w-full border-b border-gray180 bg-white lg:block">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-end px-5">
        <Language variant="topbar" />
      </div>
    </div>
  );
};

export default HeaderTopbar;
