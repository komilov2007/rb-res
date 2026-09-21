import { getDateValue } from "@/utils/format-date";
import type { GeneralProps } from "@/types/general";
import { formatTime, getDayIndex } from "@/utils/working-time";

export type WorkingTime = GeneralProps["working_time"];

export const BOOKING_DAYS_AHEAD = 14;

// The next BOOKING_DAYS_AHEAD days, today first.
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

// A "HH:mm" slot counts as passed only on today's date.
export const isPastSlot = (date: string, time: string) => {
  if (!date || !time || !isToday(date)) return false;

  const now = new Date();

  return toMinutes(time) <= now.getHours() * 60 + now.getMinutes();
};

// ---- Date / time text (typed by hand) ------------------------------------

export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const isTime = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

// "2209" -> "22.09", "22092026" -> "22.09.2026" (digits only, auto dots).
export const maskDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join(".");
};

// "1930" -> "19:30".
export const maskTime = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

// "22.09.2026" -> "2026-09-22"; null when it isn't a real calendar date.
export const parseDisplayDate = (value: string) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (!match) return null;

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return getDateValue(date);
};

// "2026-09-22" -> "22.09.2026".
export const toDisplayDate = (value: string) =>
  isIsoDate(value) ? value.split("-").reverse().join(".") : value;

// ---- Working time (general.working_time) ----------------------------------

const getDaySchedule = (workingTime: WorkingTime, date: string) => {
  if (!workingTime || !isIsoDate(date)) return null;

  const [year, month, day] = date.split("-").map(Number);

  return workingTime[String(getDayIndex(new Date(year, month - 1, day)))] ?? null;
};

// Unknown schedule (general not loaded / no entry) is never a day off —
// the backend stays the final judge; we only block what we know is closed.
export const isDayOff = (workingTime: WorkingTime, date: string) => {
  const schedule = getDaySchedule(workingTime, date);

  return Boolean(
    schedule && (schedule.is_closed || schedule.hours.length === 0),
  );
};

// Open windows of that day in minutes; a window whose close is not after
// its open (e.g. 18:00–02:00) runs to the end of the day.
const getWindows = (workingTime: WorkingTime, date: string) => {
  const schedule = getDaySchedule(workingTime, date);

  if (!schedule || schedule.is_closed) return null;

  return schedule.hours.map(({ open, close }) => {
    const start = toMinutes(open);
    const end = toMinutes(close);

    return { start, end: end > start ? end : 24 * 60 };
  });
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
