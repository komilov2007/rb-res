"use client";

import { useState, type ComponentType } from "react";
import { ArrowRight, CalendarDays, ChevronRight, Users } from "lucide-react";
import {
  IconClockFilled,
  IconClockHour3Filled,
  IconPhoneFilled,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import Button from "@/components/ui/button";
import { galleryImages } from "@/constants/atmosphere";
import { ROUTER } from "@/constants/router";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { getDateValue } from "@/utils/format-date";
import { formatTime, getDayIndex } from "@/utils/working-time";

import type { BookingFormValues } from "../../schema";
import { useDayLabel } from "../../useDayLabel";
import { getBookingDays } from "../../utils";

type IconType = ComponentType<{ size?: number; className?: string }>;

// One picked value: a big value over a small caption. Tinted once filled,
// so the card shows at a glance what's still missing.
const SummaryTile = ({
  Icon,
  value,
  caption,
}: {
  Icon: IconType;
  value: string | null;
  caption: string;
}) => {
  const isFilled = Boolean(value);

  return (
    <div
      className={`flex min-w-0 flex-col gap-2 rounded-2xl p-3 transition-colors ${
        isFilled ? "bg-primary10" : "bg-gray10"
      }`}
    >
      <Icon
        size={18}
        className={isFilled ? "text-primary" : "text-gray220/60"}
      />
      <div className="min-w-0">
        <p
          className={`truncate text-lg font-medium leading-6 ${
            isFilled ? "text-black" : "text-gray220/50"
          }`}
        >
          {value ?? "—"}
        </p>
        <p className="line-clamp-2 text-xs font-normal leading-4 text-gray220">
          {caption}
        </p>
      </div>
    </div>
  );
};

const InfoRow = ({ Icon, children }: { Icon: IconType; children: string }) => (
  <span className="flex items-center gap-3 text-sm font-normal">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
      <Icon size={15} />
    </span>
    <span className="text-gray220">{children}</span>
  </span>
);

// Desktop-only side card, stretched to the form column's height (the
// photo takes up the extra space): the atmosphere photo (links to
// /atmosphere, like the mobile hero), the picks read live from the form
// as three tiles, the submit button and the shop's hours/phone.
const BookingSummary = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const { data } = useGeneral();
  const general = data?.data;
  const getDayLabel = useDayLabel();
  const [days] = useState(getBookingDays);
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<BookingFormValues>();
  const [date, time, guests] = useWatch({
    control,
    name: ["date", "time", "guests"],
  });

  // getDayLabel gives "Bugun, 24.09" — the tile shows "24.09" big and the
  // weekday as its caption, since the full label doesn't fit a third.
  const dayIndex = days.findIndex((day) => getDateValue(day) === date);
  const [weekday, shortDate] =
    dayIndex >= 0 ? getDayLabel(days[dayIndex], dayIndex).split(", ") : [];

  // Today's hours, same derivation as the footer.
  const todayEntry = general?.working_time?.[String(getDayIndex())];
  const todayHours =
    !todayEntry || todayEntry.is_closed || todayEntry.hours.length === 0
      ? t("common_closed")
      : todayEntry.hours
          .map((hour) => `${formatTime(hour.open)} - ${formatTime(hour.close)}`)
          .join(", ");

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[28px] border border-gray180/70 bg-white shadow-[0_24px_60px_-32px_rgb(17_24_39/0.25)]">
      <button
        type="button"
        onClick={() =>
          router.push(`${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`)
        }
        className="group relative block min-h-52 w-full flex-1 overflow-hidden bg-black text-left"
      >
        <img
          src={galleryImages[0].src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-full bg-white/20 py-1.5 pl-3 pr-2 text-xs font-medium text-white backdrop-blur-md transition-colors group-hover:bg-white/30">
          {t("atmosphere_title")}
          <ChevronRight size={14} />
        </span>
      </button>

      <div className="p-5">
        <h2 className="text-base font-medium text-black">
          {t("booking_summary_title")}
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryTile
            Icon={CalendarDays}
            value={shortDate ?? null}
            caption={weekday ?? t("booking_date")}
          />
          <SummaryTile
            Icon={IconClockHour3Filled}
            value={time || null}
            caption={t("booking_time")}
          />
          <SummaryTile
            Icon={Users}
            value={guests ? String(guests) : null}
            caption={t("booking_guests")}
          />
        </div>

        <Button
          type="submit"
          variant="primary-solid"
          size="primaryWide"
          disabled={isSubmitting}
          className="mt-5 h-12 w-full rounded-xl text-base"
        >
          {t("booking_submit")}
          <ArrowRight size={18} />
        </Button>

        <div className="mt-5 flex flex-col gap-3 border-t border-gray180/70 pt-5">
          <InfoRow Icon={IconClockFilled}>
            {`${t("location_branch_picker_schedule")}: ${todayHours}`}
          </InfoRow>
          {general?.business_phone && (
            <a href={`tel:${general.business_phone}`} className="w-fit">
              <InfoRow Icon={IconPhoneFilled}>{general.business_phone}</InfoRow>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};

export default BookingSummary;
