"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, Hand, MessageCircle, X } from "lucide-react";

import Button from "@/components/ui/button";
import { useBoolean } from "@/hooks/useBoolean";
import { useCartStore } from "@/store/cart";
import { useShopid } from "@/hooks/useShopId";

const actions = [
  {
    key: "chat",
    label: "Chat",
    Icon: MessageCircle,
  },
  {
    key: "booking",
    label: "Bron qilish",
    Icon: CalendarCheck,
  },
];

const MobileAction = () => {
  const router = useRouter();
  const pathname = usePathname();
  const action = useBoolean();
  const { shopid } = useShopid();
  const cartCount = useCartStore((state) => state.cartCount);
  const MainIcon = action.value ? X : Hand;
  const hasCart = cartCount > 0;

  const handleActionClick = (key: string) => {
    if (key === "booking") {
      const page = pathname.split("/").filter(Boolean)[0] ?? "menu";

      action.setFalse();
      router.push(`/${page}/atmosphere${shopid ? `?shop_id=${shopid}` : ""}`);
    }
  };

  return (
    <>
      <button
        aria-label="Actionlarni yopish"
        onClick={action.setFalse}
        className={`fixed inset-0 z-[60] bg-black/35 backdrop-blur-[3px] transition-all duration-500 ease-out ${
          action.value ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed bottom-[96px] right-4 z-[70] lg:right-8 ${
          hasCart ? "lg:bottom-32" : "lg:bottom-8"
        }`}
      >
        <div className="flex flex-col items-end gap-2">
          <div className="flex origin-bottom-right flex-col items-end gap-2">
            {actions.map(({ key, label, Icon }, index) => (
              <Button
                key={key}
                type="button"
                variant="plain"
                size="none"
                onClick={() => handleActionClick(key)}
                className={`h-14 gap-2 rounded-full bg-white py-1 pl-4 pr-1 text-sm font-extrabold text-black shadow-[0_8px_28px_var(--black40)] transition-all duration-500 ease-out ${
                  action.value
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-6 scale-90 opacity-0"
                }`}
                style={{
                  transitionDelay: action.value
                    ? `${index * 70}ms`
                    : `${(actions.length - index - 1) * 45}ms`,
                }}
              >
                <span>{label}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <Icon size={26} />
                </span>
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="primary-solid"
            size="icon"
            onClick={action.toggle}
            className={`h-14 w-14 rounded-full shadow-[0_10px_30px_var(--black40)] transition-all duration-300 active:scale-95 ${
              action.value ? "rotate-90" : "rotate-0"
            }`}
          >
            <MainIcon size={24} className="transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileAction;
