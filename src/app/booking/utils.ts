"use client";

import { getDateValue } from "@/utils/format-date";
import type { GeneralProps } from "@/types/general";
import { formatTime, getDayIndex } from "@/utils/working-time";
import { BOOKING_TIMES } from "@/constants/booking";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  createReservation,
  getReservationDetail,
  updateReservation,
} from "@/apis/reservation";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { ROUTER } from "@/constants/router";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { getLocalPhone } from "@/utils/format-number";
import { bookingSchema, type BookingFormValues, type BookingSchemaContext } from "./booking";

export type WorkingTime = GeneralProps["working_time"];

export const BOOKING_DAYS_AHEAD = 14;

export const getBookingDays = () =>
  Array.from({ length: BOOKING_DAYS_AHEAD }, (_, index) => {
    const date = new Date();

    date.setDate(date.getDate() + index);

    return date;
  });

export const isToday = (date: string) => date === getDateValue(new Date());

const toMinutes = (time: string) => {
  const [hours, minutes] = formatTime(time).split(":").map(Number);

  return hours * 60 + minutes;
};

export const isPastSlot = (date: string, time: string) => {
  if (!date || !time || !isToday(date)) return false;

  const now = new Date();

  return toMinutes(time) <= now.getHours() * 60 + now.getMinutes();
};

export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const isTime = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const maskDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join(".");
};

export const maskTime = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

export const parseDisplayDate = (value: string) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (!match) return null;

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return getDateValue(date);
};

export const toDisplayDate = (value: string) =>
  isIsoDate(value) ? value.split("-").reverse().join(".") : value;

const getDaySchedule = (workingTime: WorkingTime, date: string) => {
  if (!workingTime || !isIsoDate(date)) return null;

  const [year, month, day] = date.split("-").map(Number);

  return workingTime[String(getDayIndex(new Date(year, month - 1, day)))] ?? null;
};

export const isDayOff = (workingTime: WorkingTime, date: string) => {
  const schedule = getDaySchedule(workingTime, date);

  return Boolean(
    schedule && (schedule.is_closed || schedule.hours.length === 0),
  );
};

const getWindows = (workingTime: WorkingTime, date: string) => {
  const schedule = getDaySchedule(workingTime, date);

  if (!schedule || schedule.is_closed) return null;

  return schedule.hours.map(({ open, close }) => {
    const start = toMinutes(open);
    const end = toMinutes(close);

    return { start, end: end > start ? end : 24 * 60 };
  });
};

const BOOKING_SLOT_MINUTES = 30;

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const getBookingTimes = (workingTime: WorkingTime, date: string) => {
  if (!workingTime) return BOOKING_TIMES;

  const day =
    date ||
    getBookingDays()
      .map(getDateValue)
      .find((value) => !isDayOff(workingTime, value));
  const windows = day ? getWindows(workingTime, day) : null;

  if (!windows) {
    return day && !isDayOff(workingTime, day) ? BOOKING_TIMES : [];
  }

  const slots = new Set<number>();

  windows.forEach(({ start, end }) => {
    const first = Math.ceil(start / BOOKING_SLOT_MINUTES) * BOOKING_SLOT_MINUTES;

    for (let minutes = first; minutes < end; minutes += BOOKING_SLOT_MINUTES) {
      slots.add(minutes);
    }
  });

  return [...slots].sort((a, b) => a - b).map(toTime);
};

export const isWithinWorkingHours = (
  workingTime: WorkingTime,
  date: string,
  time: string,
) => {
  const windows = getWindows(workingTime, date);

  if (!windows) return !isDayOff(workingTime, date);

  const minutes = toMinutes(time);

  return windows.some(({ start, end }) => minutes >= start && minutes < end);
};

export const useDayLabel = () => {
  const t = useTranslations();

  return (day: Date, index: number) => {
    const weekday =
      index === 0
        ? t("common_today").replace(/^./, (char) => char.toUpperCase())
        : t(`weekdays_${((day.getDay() + 6) % 7) + 1}`);
    const date = `${String(day.getDate()).padStart(2, "0")}.${String(
      day.getMonth() + 1,
    ).padStart(2, "0")}`;

    return `${weekday}, ${date}`;
  };
};

export const usePage = () => {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { shopid } = useShopId();
  const reservationId = useSearchParams().get("reservation");
  const auth = useAuthStore((state) => state.auth);
  const { data: general } = useGeneral();

  const { data: detail } = useQuery({
    enabled: Boolean(reservationId),
    queryKey: [REACT_QUERY_KEYS.RESERVATION_DETAIL, reservationId],
    queryFn: () => getReservationDetail(reservationId as string),
  });
  const reservation = detail?.data;

  const form = useForm<BookingFormValues, BookingSchemaContext>({
    mode: "onChange",
    resolver: yupResolver(bookingSchema),
    context: { workingTime: general?.data?.working_time },
    defaultValues: bookingSchema.cast(
      {
        name: auth?.firstname ?? "",
        phone: getLocalPhone(auth?.phone),
      },
      { assert: false },
    ),
    values: reservation
      ? {
          branch: reservation.branch.id,
          name: reservation.name,
          phone: getLocalPhone(reservation.phone),
          extra_phone: getLocalPhone(reservation.extra_phone),
          date: reservation.date,
          time: formatTime(reservation.time),
          guests: reservation.guests,
          comment: reservation.comment ?? "",
        }
      : undefined,
  });

  const { mutateAsync } = useMutation({
    mutationFn: (values: BookingFormValues) => {
      const payload = {
        branch: values.branch,
        date: values.date,
        time: values.time,
        guests: values.guests,
        ...(values.name && { name: values.name }),
        ...(values.extra_phone && { extra_phone: `998${values.extra_phone}` }),
        ...(values.comment.trim() && { comment: values.comment.trim() }),
      };

      return reservationId
        ? updateReservation(reservationId, payload)
        : createReservation(payload);
    },
    onSuccess: () => {
      if (reservationId) {
        toast.success(t("booking_updated"));
      } else {
        toast.success(t("booking_success"), {
          description: t("booking_success_hint"),
          duration: 6000,
        });
      }

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.RESERVATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.RESERVATION_DETAIL],
      });
      router.replace(
        `${ROUTER.PROFILE_RESERVATIONS}${shopid ? `?shop_id=${shopid}` : ""}`,
      );
    },
  });

  const onSubmit: SubmitHandler<BookingFormValues> = async (values) => {
    try {
      await mutateAsync(values);
    } catch {}
  };

  return { form, onSubmit };
};
