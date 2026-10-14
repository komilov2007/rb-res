"use client";

import {
  IconCalendarEventFilled,
  IconClockFilled,
  IconEditFilled,
  IconMapPinFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { ReservationProps, ReservationStatus } from "@/types/reservation";
import { formatTime } from "@/utils/working-time";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "reservations_status_pending",
  ACCEPTED: "reservations_status_accepted",
  REJECTED: "reservations_status_rejected",
  CANCELLED: "reservations_status_cancelled",
};

const STATUS_CLASS_NAMES: Record<ReservationStatus, string> = {
  PENDING: "bg-yellow10 text-yellow",
  ACCEPTED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red/10 text-red",
  CANCELLED: "bg-gray10 text-gray220",
};

const toDisplayDate = (date: string) => date.split("-").reverse().join(".");

type ReservationCardProps = {
  reservation: ReservationProps;
  onEdit?: () => void;
  onCancel?: () => void;
};

const ReservationCard = ({
  reservation,
  onEdit,
  onCancel,
}: ReservationCardProps) => {
  const t = useTranslations();
  const { status } = reservation;
  const canEdit = Boolean(onEdit) && status === "PENDING";
  const canCancel =
    Boolean(onCancel) && (status === "PENDING" || status === "ACCEPTED");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray180 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary10 text-primary">
            <IconMapPinFilled size={20} />
          </span>
          <div className="min-w-0">
            <p className="line-clamp-1 text-base font-normal text-black">
              {reservation.branch.name}
            </p>
            <p className="info-value line-clamp-2">
              {reservation.branch.address}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium leading-none ${STATUS_CLASS_NAMES[status] ?? "bg-gray10 text-gray220"}`}
        >
          {STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[15px] font-normal text-black">
        <span className="flex min-w-0 items-center gap-2 rounded-xl bg-gray10 px-3 py-2.5">
          <IconCalendarEventFilled size={18} className="shrink-0 text-primary" />
          <span className="truncate">{toDisplayDate(reservation.date)}</span>
        </span>
        <span className="flex min-w-0 items-center gap-2 rounded-xl bg-gray10 px-3 py-2.5">
          <IconClockFilled size={18} className="shrink-0 text-primary" />
          <span className="truncate">{formatTime(reservation.time)}</span>
        </span>
        <span className="flex min-w-0 items-center gap-2 rounded-xl bg-gray10 px-3 py-2.5">
          <IconUserFilled size={18} className="shrink-0 text-primary" />
          <span className="truncate">
            {t("reservations_guests", { count: reservation.guests })}
          </span>
        </span>
      </div>

      {reservation.comment && (
        <div>
          <p className="info-label">{t("reservations_comment")}</p>
          <p className="info-value break-words">{reservation.comment}</p>
        </div>
      )}

      {reservation.seller_comment && (
        <div className="rounded-xl bg-gray10 px-3 py-2.5">
          <p className="info-label">{t("reservations_seller_comment")}</p>
          <p className="info-value break-words">
            {reservation.seller_comment}
          </p>
        </div>
      )}

      {(canEdit || canCancel) && (
        <div className="flex gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray10 text-sm font-normal text-black"
            >
              <IconEditFilled size={15} className="text-gray220" />
              {t("common_edit")}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-10 flex-1 items-center justify-center rounded-xl bg-red/10 text-sm font-normal text-red"
            >
              {t("common_cancel")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const ReservationCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-white p-4 lg:border-gray180">
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-4 w-28 rounded-full" />
          <div className="skeleton h-3 w-40 rounded-full" />
        </div>
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="skeleton h-11 rounded-xl" />
      <div className="skeleton h-11 rounded-xl" />
      <div className="skeleton h-11 rounded-xl" />
    </div>
    <div className="skeleton h-10 w-full rounded-xl" />
  </div>
);

export default ReservationCard;
