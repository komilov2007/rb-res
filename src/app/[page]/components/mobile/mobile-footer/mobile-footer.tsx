"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";

import { navItems } from "@/constants/navbar";

import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useShopid } from "@/hooks/useShopId";

const MobileFooter = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { shopid } = useShopid();

  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const setProfileModal = useAuthStore((state) => state.setProfileModal);

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
    });
  };

  const handleClick = (key: string) => {
    switch (key) {
      case "menu":
        if (pathname === "/") {
          scrollTop();
        } else {
          router.push(`/${shopid ? `?shop_id=${shopid}` : ""}`);
        }
        break;

      case "cart":
        openCartModal("mobile");
        break;

      case "category":
        break;

      case "profile":
        if (hasAccess) {
          setProfileModal(true)();
        } else {
          setLoginModal(true)();
        }
        break;

      default:
        break;
    }
  };

  const getActive = (key: string, active: boolean) => {
    if (key === "menu") return pathname === "/";

    return active;
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 lg:hidden">
      <div className="rounded-[20px] border border-white/60 bg-white/75 p-2 shadow-[0_10px_40px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
        <ul className="grid grid-cols-3 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCart = item.key === "cart";
            const isActive = getActive(item.key, item.active);

            return (
              <li key={item.key} className="h-[50px]">
                <Button
                  type="button"
                  variant="plain"
                  size="none"
                  onClick={() => handleClick(item.key)}
                  className={`
                    h-[50px]
                    w-full
                    flex-col
                    rounded-[15px]
                    p-1
                    ${
                      isActive
                        ? `
                          border
                          border-white/70
                          text-primary
                          shadow-[0_4px_18px_rgba(15,23,42,0.08)]
                        `
                        : `
                          text-gray-500
                        `
                    }
                  `}
                >
                  <span className="relative">
                    <Icon size={21} strokeWidth={isActive ? 2.2 : 2.1} />

                    {isCart && cartCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-white ring-1 ring-white">
                        {cartCount}
                      </span>
                    )}
                  </span>

                  <span className="text-[11px] font-semibold">
                    {t(item.label)}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default MobileFooter;
