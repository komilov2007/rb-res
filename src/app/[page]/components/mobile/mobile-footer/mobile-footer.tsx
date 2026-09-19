"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";

import { navItems } from "@/constants/navbar";
import { ROUTER } from "@/constants/router";

import { useCartStore } from "@/stores/cart";
import { useActiveOrdersCount } from "@/hooks/useActiveOrdersCount";
import { useShopid } from "@/hooks/useShopId";

const MobileFooter = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { shopid } = useShopid();

  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);
  const activeOrdersCount = useActiveOrdersCount();

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

      case "order":
        router.push(`${ROUTER.MY_ORDERS}${shopid ? `?shop_id=${shopid}` : ""}`);
        break;

      case "category":
        router.push(`${ROUTER.CATEGORIES}${shopid ? `?shop_id=${shopid}` : ""}`);
        break;

      case "profile":
        router.push(`/profile${shopid ? `?shop_id=${shopid}` : ""}`);
        break;

      default:
        break;
    }
  };

  // Active tab follows the current route (including nested pages, e.g.
  // /profile/about keeps "Profil" active).
  const isRouteActive = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);

  const getActive = (key: string, active: boolean) => {
    switch (key) {
      case "menu":
        return pathname === "/";
      case "category":
        return (
          isRouteActive(ROUTER.CATEGORIES) || isRouteActive(ROUTER.CATEGORY)
        );
      case "order":
        return isRouteActive(ROUTER.MY_ORDERS);
      case "profile":
        return isRouteActive(ROUTER.PROFILE);
      default:
        return active;
    }
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 lg:hidden">
      {/* The frosted-glass look (translucent white + blur) and the actual
          content sit in separate layers on purpose: putting bg-white/75 +
          backdrop-blur directly on the container that also holds the cart
          badge let the badge's solid primary color bleed/smear into the
          translucent background around it. This layer only paints the
          glass effect; content renders in the opaque layer above it, so
          nothing behind the badge is ever translucent or blurred. */}
      <div className="relative rounded-[20px] shadow-[0_10px_40px_rgba(15,23,42,0.16)]">
        <div className="absolute inset-0 rounded-[20px] border border-white/60 bg-white/75 backdrop-blur-2xl" />
        <ul className="relative grid grid-cols-5 items-center p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCart = item.key === "cart";
            const isOrder = item.key === "order";
            const isActive = getActive(item.key, item.active);

            return (
              <li key={item.key} className="h-[50px] min-w-0">
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
                    px-0.5
                    py-1
                    ${
                      isActive
                        ? `
                          border
                          border-white/70
                          bg-white
                          text-black
                          shadow-[0_4px_18px_rgba(15,23,42,0.08)]
                        `
                        : `
                          bg-transparent!
                          text-gray-500
                        `
                    }
                  `}
                >
                  <span className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 2.1} />

                    {isCart && cartCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-white ring-1 ring-white">
                        {cartCount}
                      </span>
                    )}

                    {isOrder && activeOrdersCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-white ring-1 ring-white">
                        {activeOrdersCount}
                      </span>
                    )}
                  </span>

                  <span
                    className={`max-w-full truncate text-[10px] ${
                      isActive ? "font-medium" : "font-normal"
                    }`}
                  >
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




