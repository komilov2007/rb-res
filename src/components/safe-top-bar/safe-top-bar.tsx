"use client";

import { usePathname } from "next/navigation";

import { ROUTER } from "@/constants/router";

// Telegram fullscreen'da (va notch'li brauzerlarda) ekran tepasidagi
// status bar + Telegram Close/menu tugmalari zonasini oq panel bilan yopadi,
// shunda sahifa kontenti scroll paytida ularning tagiga kirib qolmaydi.
// Bosh sahifa o'z header'iga ega, shuning uchun u yerda ko'rsatilmaydi.
// --safe-top 0 bo'lsa (oddiy brauzer/desktop) panel balandligi ham 0.
const SafeTopBar = () => {
  const pathname = usePathname();

  if (pathname === ROUTER.HOME) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-(--safe-top) bg-white lg:hidden"
    />
  );
};

export default SafeTopBar;
