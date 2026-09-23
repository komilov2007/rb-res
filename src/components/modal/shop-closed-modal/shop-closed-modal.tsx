"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { IconClockFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import ClosedIcon from "@/assets/icons/closed.png";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ROUTER } from "@/constants/router";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { useShopStatusStore } from "@/stores/shop-status";
import { getNextOpening } from "@/utils/working-time";

// Mounted once globally (provider.tsx) — opened either by GeneralProvider on
// a closed shop's first load, or by useCartFooter's "Buyurtma berish" check.
// Reads is_open/message/working_time straight from the shared useGeneral
// cache, so it always reflects the shop's current status.
const ShopClosedModal = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const { data: general } = useGeneral();
  const closedModalOpen = useShopStatusStore((state) => state.closedModalOpen);
  const closeClosedModal = useShopStatusStore(
    (state) => state.closeClosedModal,
  );

  // Not "is today a day off?" but "when does it open next?" — a shop that
  // opens at 10:00 is closed at 08:00 yet must still say "opens today at
  // 10:00" instead of "today is a day off".
  const nextOpening = getNextOpening(general?.data.working_time);

  const getOpeningLabel = () => {
    if (!nextOpening) return t("shared_shop_closed_no_schedule");

    if (nextOpening.daysAhead === 0) {
      return t("shared_shop_closed_opens_today", {
        open: nextOpening.open,
        close: nextOpening.close,
      });
    }

    if (nextOpening.daysAhead === 1) {
      return t("shared_shop_closed_opens_tomorrow", {
        open: nextOpening.open,
        close: nextOpening.close,
      });
    }

    return t("shared_shop_closed_opens_on_day", {
      day: t(`weekdays_${nextOpening.dayIndex}`),
      open: nextOpening.open,
      close: nextOpening.close,
    });
  };

  const goToWorkingHours = () => {
    closeClosedModal();
    router.push(`${ROUTER.PROFILE_ABOUT}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  return (
    <Sheet
      open={closedModalOpen}
      onOpenChange={(open) => {
        if (!open) closeClosedModal();
      }}
    >
      <SheetContent
        side="bottom"
        desktopModal
        showCloseButton={false}
        aria-describedby={undefined}
        className="items-center gap-0 rounded-t-3xl border-gray180 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 text-center"
      >
        <span className="mx-auto h-1 w-10 shrink-0 rounded-full bg-gray180 lg:hidden" />

        <img
          src={ClosedIcon.src}
          alt=""
          className="mt-2 h-56 w-56 shrink-0 object-contain"
        />

        <h2 className="mt-1 text-lg font-medium text-black">
          {t("shared_shop_closed_title")}
        </h2>
        <p className="mt-1 text-sm font-normal text-gray220">
          {general?.data.message || t("shared_shop_closed_default_message")}
        </p>
        {/* "We'll open soon" only fits a same-day reopening — saying it when
            the next window is days away would be wrong. */}
        {nextOpening?.daysAhead === 0 && (
          <p className="mt-0.5 text-sm font-medium text-primary">
            {t("shared_shop_closed_opening_soon")}
          </p>
        )}

        {/* The working-hours row is now the modal's only action — the
            "Tushundim" button was removed, the sheet still closes on an
            overlay tap / Escape like every other bottom sheet here. */}
        <button
          type="button"
          onClick={goToWorkingHours}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray180 px-4 py-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary10 text-primary">
            <IconClockFilled size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="info-label block">
              {getOpeningLabel()}
            </span>
            <span className="info-value block">
              {t("shared_shop_closed_view_all_hours")}
            </span>
          </span>
          <ChevronRight size={16} className="shrink-0 text-gray220" />
        </button>
      </SheetContent>
    </Sheet>
  );
};

export default ShopClosedModal;
