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
import { useFormContext, useWatch, useFormState } from "react-hook-form";

import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useAtmosphere } from "@/hooks/useAtmosphere";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { getAtmosphereCover } from "@/utils/atmosphere";
import { getDateValue } from "@/utils/format-date";
import { handleImageFallback } from "@/utils/image";
import { getTodayHours } from "@/utils/working-time";

import type { BookingFormValues } from "@/app/booking/booking";
import { useDayLabel } from "@/app/booking/utils";
import { getBookingDays } from "@/app/booking/utils";

type IconType = ComponentType<{ size?: number; className?: string }>;

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

const TableIllustration = () => (
  <div className="relative grid min-h-52 flex-1 place-items-center overflow-hidden bg-primary10">
    <span className="absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
    <svg
      aria-hidden
      viewBox="0 0 320 200"
      className="relative w-[78%] max-w-sm text-primary"
      fill="currentColor"
    >
      <path d="M160 0v38" stroke="currentColor" strokeWidth={2} />
      <path d="M142 38h36l12 20h-60z" />
      <ellipse cx={160} cy={62} rx={18} ry={3} fillOpacity={0.35} />
      <path d="M128 64l-30 54h124l-30-54z" fillOpacity={0.07} />

      <path
        d="M30 172h260"
        stroke="currentColor"
        strokeWidth={2}
        strokeOpacity={0.25}
        strokeLinecap="round"
      />

      <rect x={52} y={90} width={6} height={82} rx={3} fillOpacity={0.55} />
      <rect x={52} y={134} width={42} height={7} rx={3.5} fillOpacity={0.55} />
      <rect x={87} y={141} width={5} height={31} rx={2.5} fillOpacity={0.55} />

      <rect x={262} y={90} width={6} height={82} rx={3} fillOpacity={0.55} />
      <rect x={226} y={134} width={42} height={7} rx={3.5} fillOpacity={0.55} />
      <rect x={228} y={141} width={5} height={31} rx={2.5} fillOpacity={0.55} />

      <rect x={88} y={120} width={144} height={8} rx={4} />
      <rect x={156} y={128} width={8} height={42} rx={3} />
      <ellipse cx={160} cy={172} rx={26} ry={4} />

      <ellipse
        cx={116}
        cy={117}
        rx={15}
        ry={3}
        fill="white"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <ellipse
        cx={204}
        cy={117}
        rx={15}
        ry={3}
        fill="white"
        stroke="currentColor"
        strokeWidth={1.5}
      />

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <path d="M134 100c0 7 3 10 6 10s6-3 6-10zM140 110v9M136 119h8" />
        <path d="M174 100c0 7 3 10 6 10s6-3 6-10zM180 110v9M176 119h8" />
        <path d="M160 104V86M160 96c-6-2-9-7-9-12 6 1 9 5 9 12zM160 92c5-2 8-6 8-11-5 1-8 5-8 11z" />
      </g>
      <rect x={154} y={104} width={12} height={16} rx={4} fillOpacity={0.8} />
    </svg>
  </div>
);

const BookingSummary = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const { data } = useGeneral();
  const general = data?.data;
  const { atmosphere, isLoading: isAtmosphereLoading } = useAtmosphere();
  const atmosphereCover = getAtmosphereCover(atmosphere);
  const getDayLabel = useDayLabel();
  const [days] = useState(getBookingDays);
  const { control } = useFormContext<BookingFormValues>();
  const { isSubmitting } = useFormState<BookingFormValues>();
  const [date, time, guests] = useWatch({
    control,
    name: ["date", "time", "guests"],
  });

  const dayIndex = days.findIndex((day) => getDateValue(day) === date);
  const [weekday, shortDate] =
    dayIndex >= 0 ? getDayLabel(days[dayIndex], dayIndex).split(", ") : [];

  const todayHours = getTodayHours(general?.working_time) ?? t("common_closed");

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[28px] border border-gray180/70 bg-white shadow-[0_24px_60px_-32px_rgb(17_24_39/0.25)]">
      {isAtmosphereLoading ? (
        <div className="skeleton min-h-52 flex-1" />
      ) : atmosphereCover ? (
        <button
          type="button"
          onClick={() =>
            router.push(
              `${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`,
            )
          }
          className="group relative block min-h-52 w-full flex-1 overflow-hidden bg-black text-left"
        >
          <img
            src={atmosphereCover}
            onError={handleImageFallback}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-full bg-white/20 py-1.5 pl-3 pr-2 text-xs font-medium text-white backdrop-blur-md transition-colors group-hover:bg-white/30">
            {t("atmosphere_title")}
            <ChevronRight size={14} />
          </span>
        </button>
      ) : (
        <TableIllustration />
      )}

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
