"use client";

import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { IconClockHour3Filled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import Button from "@/components/ui/button";
import type { BookingFormValues } from "@/app/booking/booking";
import type { ComponentType, ReactNode } from "react";

const toShortDate = (value: string) =>
  value ? value.split("-").reverse().slice(0, 2).join(".") : "—";

type TwoFooterProps = {
  className?: string;
};

const TwoFooter = ({ className = "" }: TwoFooterProps) => {
  const t = useTranslations();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<BookingFormValues>();
  const [date, time, guests] = useWatch({
    control,
    name: ["date", "time", "guests"],
  });

  return (
    <div
      className={`shrink-0 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:p-0 ${className}`}
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-3 flex items-center justify-center gap-4 text-sm font-normal text-black">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={16} className="text-gray220" />
            {toShortDate(date)}
          </span>
          <span className="flex items-center gap-1.5">
            <IconClockHour3Filled size={16} className="text-gray220" />
            {time || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={16} className="text-gray220" />
            {guests || "—"}
          </span>
        </div>
        <Button
          type="submit"
          variant="primary-solid"
          size="primaryWide"
          disabled={isSubmitting}
          className="h-13 w-full rounded-xl text-base"
        >
          {t("booking_submit")}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default TwoFooter;

type IconType = ComponentType<{ size?: number }>;

export const tileClassName = (hasError = false) =>
  `flex min-h-13 w-full items-center gap-2.5 rounded-xl border bg-white px-2.5 py-1.5 text-left transition-colors focus-within:border-primary data-[state=open]:border-primary ${
    hasError ? "border-red" : "border-gray180/60"
  }`;

export const TileIcon = ({ Icon }: { Icon: IconType }) => (
  <span className="flex w-6 shrink-0 items-center justify-center text-gray220">
    <Icon size={18} />
  </span>
);

export const TileLabel = ({ children }: { children: ReactNode }) => (
  <span className="block text-[11px] font-normal leading-4 text-gray220/70">{children}</span>
);

export const TileError = ({ message }: { message?: string }) =>
  message ? (
    <span className="mt-1 block px-1 text-xs text-red">{message}</span>
  ) : null;

type TwoFieldProps = {
  Icon: IconType;
  label: ReactNode;
  children: ReactNode;
  end?: ReactNode;
  error?: string;
};

const TwoField = ({ Icon, label, children, end, error }: TwoFieldProps) => (
  <div>
    <div className={tileClassName(Boolean(error))}>
      <TileIcon Icon={Icon} />
      <div className="min-w-0 flex-1">
        <TileLabel>{label}</TileLabel>
        {children}
      </div>
      {end}
    </div>
    <TileError message={error} />
  </div>
);

export { TwoField };
