"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  LayoutGrid,
  Hand,
  MessageCircle,
  MessageSquareText,
  Phone,
  User,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTER } from "@/constants/router";
import { useBoolean } from "@/hooks/useBoolean";
import { useShopid } from "@/hooks/useShopId";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";
import { useUiStore } from "@/stores/ui";
import { useProductDetailStore } from "@/stores/product-detail";
import { formatPhone, getDigits } from "@/utils/format-number";
import DatePicker from "@/app/[page]/atmosphere/components/booking-form/components/date-picker";
import TimePicker from "@/app/[page]/atmosphere/components/booking-form/components/time-picker";

// `label` holds a translation key, resolved with t() at render.
const actions = [
  {
    key: "chat",
    label: "home_mobile_action_chat",
    Icon: MessageCircle,
  },
  {
    key: "category",
    label: "category",
    Icon: LayoutGrid,
  },
  // Temporarily hidden — uncomment to bring "Bron qilish" back. The booking
  // sheet and handler below are left in place for that.
  // {
  //   key: "booking",
  //   label: "booking_title",
  //   Icon: CalendarCheck,
  // },
];

const MobileAction = () => {
  const t = useTranslations();
  const action = useBoolean();
  const booking = useBoolean();
  const router = useRouter();
  const pathname = usePathname();
  const { shopid } = useShopid();
  const [guestCount, setGuestCount] = useState("1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const cartCount = useCartStore((state) => state.cartCount);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const isDiscountDrawerOpen = useUiStore(
    (state) => state.isDiscountDrawerOpen,
  );
  const isMobileHeaderDrawerOpen = useUiStore(
    (state) => state.isMobileHeaderDrawerOpen,
  );
  const isProductDetailOpen = useProductDetailStore((state) => state.isOpen);
  const locationModal = useLocationStore((state) => state.locationModal);
  const selectionModal = useBranchSelectionStore(
    (state) => state.selectionModal,
  );
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const MainIcon = action.value ? X : Hand;
  const hasCart = cartCount > 0;
  const isCartPage = pathname.includes("/cart");

  const handleActionClick = (key: string) => {
    if (key === "booking") {
      action.setFalse();

      if (!hasAccess) {
        setLoginModal(true)();
        return;
      }

      booking.setTrue();
      return;
    }

    if (key === "chat") {
      action.setFalse();

      if (!hasAccess) {
        setLoginModal(true)();
        return;
      }

      router.push(`${ROUTER.CHAT}${shopid ? `?shop_id=${shopid}` : ""}`);
    }

    if (key === "category") {
      action.setFalse();
      router.push(`${ROUTER.CATEGORIES}${shopid ? `?shop_id=${shopid}` : ""}`);
    }
  };

  const handleGuestChange = (value: string) => {
    setGuestCount(getDigits(value, 3));
  };

  if (
    isCartPage ||
    isCartOpen ||
    isDiscountDrawerOpen ||
    isMobileHeaderDrawerOpen ||
    isProductDetailOpen ||
    locationModal ||
    // Same visibility rule as BranchSelectionModal (shown only when logged in).
    (selectionModal && hasAccess)
  )
    return null;

  return (
    <>
      {!booking.value && (
        <>
          <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-[60] bg-black/10 transition-opacity duration-200 supports-backdrop-filter:backdrop-blur-xs ${
              action.value ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            data-mobile-action-widget
            className={`pointer-events-none fixed bottom-[96px] right-4 z-[70] w-fit max-w-[calc(100vw-2rem)] lg:right-8 ${
              hasCart ? "lg:bottom-32" : "lg:bottom-8"
            }`}
          >
            <div className="flex flex-col items-end gap-2">
              <div
                className={`flex origin-bottom-right flex-col items-end gap-2 overflow-hidden transition-all duration-500 ease-out ${
                  action.value
                    ? "pointer-events-auto max-h-60"
                    : "pointer-events-none max-h-0"
                }`}
              >
                {actions.map(({ key, label, Icon }, index) => (
                  <Button
                    key={key}
                    type="button"
                    variant="plain"
                    size="none"
                    onClick={() => handleActionClick(key)}
                    className={`h-13 gap-2 rounded-full border border-white/60 bg-white/70 py-0.5 pl-4 pr-1 text-sm font-medium text-black backdrop-blur-md transition-all duration-500 ease-out ${
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
                    <span>{t(label)}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                      <Icon size={20} />
                    </span>
                  </Button>
                ))}
              </div>

              <Button
                type="button"
                variant={action.value ? "plain" : "primary-solid"}
                size="icon"
                onClick={action.toggle}
                className={`pointer-events-auto h-14 w-14 rounded-full transition-all duration-300 active:scale-95 ${
                  action.value
                    ? "rotate-90 border border-white/60 bg-white/70 text-black backdrop-blur-md"
                    : "rotate-0"
                }`}
              >
                <MainIcon
                  size={24}
                  className="transition-transform duration-300"
                />
              </Button>
            </div>
          </div>
        </>
      )}

      <Sheet open={booking.value} onOpenChange={booking.toggle}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[88vh] rounded-t-[24px] border-0 bg-white p-0 lg:hidden"
        >
          <SheetHeader className="px-4 pb-2 pt-3">
            <span className="mx-auto h-1 w-10 rounded-full bg-gray180" />
            <SheetTitle className="sr-only">{t("booking_title")}</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-[118px_minmax(0,1fr)] gap-3 overflow-y-auto px-4 pb-5">
            <div className="sticky top-0 h-[360px] overflow-hidden rounded-2xl bg-black">
              <img
                src="/boking.png"
                alt={t("booking_title")}
                className="h-full w-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/65" />
              <div className="absolute inset-x-3 bottom-4 text-white">
                <span className="mb-2 block h-1 w-8 rounded-full bg-white" />
                <p className="text-[10px] font-bold uppercase leading-3 text-white">
                  {t("booking_title")}
                </p>
                <h3 className="mt-2 text-lg font-bold leading-5">
                  {t("booking_sheet_title")}
                </h3>
                <p className="mt-2 text-xs font-medium leading-4 text-white/85">
                  {t("booking_sheet_subtitle")}
                </p>
              </div>
            </div>

            <form className="min-w-0 space-y-2">
              <Input
                IconStart={User}
                value={auth?.firstname ?? ""}
                readOnly
                placeholder={t("booking_your_name")}
                wrapperClassName="h-10 rounded-xl bg-gray10 px-3"
                className="text-xs font-normal text-black"
              />

              <Input
                IconStart={Phone}
                value={auth?.phone ? formatPhone(auth.phone) : ""}
                readOnly
                placeholder={t("phone_number")}
                wrapperClassName="h-10 rounded-xl bg-gray10 px-3"
                className="text-xs font-normal text-black"
              />

              <DatePicker
                value={date}
                month={calendarMonth}
                onChange={setDate}
                onChangeMonth={setCalendarMonth}
              />

              <TimePicker
                value={time}
                onChange={setTime}
                placeholder={t("booking_time")}
              />

              <Input
                IconStart={Users}
                value={guestCount}
                onChange={(event) => handleGuestChange(event.target.value)}
                inputMode="numeric"
                placeholder={t("booking_guests")}
                wrapperClassName="h-10 rounded-xl bg-gray10 px-3"
                className="text-xs font-normal text-black"
              />

              <div className="flex min-h-20 rounded-xl bg-gray10 px-3 py-3">
                <MessageSquareText
                  size={16}
                  className="mr-2 shrink-0 text-gray220"
                />
                <textarea
                  placeholder={t("booking_comment_short_placeholder")}
                  // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
                  className="min-h-14 w-full resize-none bg-transparent text-base font-normal text-black outline-none placeholder:text-gray220"
                />
              </div>

              <Button
                type="button"
                variant="primary-solid"
                size="none"
                className="h-11 w-full rounded-xl text-sm"
              >
                {t("booking_submit")}
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileAction;

