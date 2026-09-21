import * as yup from "yup";

import { getDateValue } from "@/utils/format-date";
import { translate } from "@/utils/translate";

import {
  isDayOff,
  isIsoDate,
  isPastSlot,
  isTime,
  isWithinWorkingHours,
  type WorkingTime,
} from "./utils";

// Passed via useForm({ context }) — the shop's schedule from general.
export type BookingSchemaContext = { workingTime?: WorkingTime };

const PHONE_LENGTH = 9;

const isFullPhone = (value?: string) => value?.length === PHONE_LENGTH;

export const bookingSchema = yup.object({
  // Taken from the profile and read-only on the page — nothing for the
  // user to fix, so not validated here.
  name: yup.string().default(""),
  phone: yup.string().default(""),
  // Optional — only validated once something has been typed into it.
  extra_phone: yup
    .string()
    .default("")
    .test(
      "full-phone",
      () => translate("booking_errors_phone_invalid"),
      (value) => !value || isFullPhone(value),
    ),
  // A hand-typed date that isn't a real day stays in the form as typed
  // ("31.02.2026"), so it fails "valid" instead of silently clearing.
  date: yup
    .string()
    .default("")
    .required(() => translate("booking_errors_date_required"))
    .test(
      "valid",
      () => translate("booking_errors_date_invalid"),
      (value) => !value || isIsoDate(value),
    )
    // "YYYY-MM-DD" strings compare correctly as plain strings.
    .test(
      "not-past",
      () => translate("booking_errors_date_past"),
      (value) => !value || !isIsoDate(value) || value >= getDateValue(new Date()),
    )
    .test(
      "day-off",
      () => translate("booking_errors_date_closed"),
      function (value) {
        const { workingTime } = (this.options.context ?? {}) as BookingSchemaContext;

        return !value || !isDayOff(workingTime, value);
      },
    ),
  time: yup
    .string()
    .default("")
    .required(() => translate("booking_errors_time_required"))
    .test(
      "valid",
      () => translate("booking_errors_time_invalid"),
      (value) => !value || isTime(value),
    )
    .test(
      "not-past",
      () => translate("booking_errors_time_past"),
      function (value) {
        const { date } = this.parent as { date?: string };

        return !value || !isTime(value) || !isPastSlot(date ?? "", value);
      },
    )
    .test(
      "working-hours",
      () => translate("booking_errors_time_closed"),
      function (value) {
        const { date } = this.parent as { date?: string };
        const { workingTime } = (this.options.context ?? {}) as BookingSchemaContext;

        // Only judged once the date itself is a valid working day — a day
        // off already shows its own error on the date field.
        if (!value || !isTime(value) || !date || !isIsoDate(date)) return true;
        if (isDayOff(workingTime, date)) return true;

        return isWithinWorkingHours(workingTime, date, value);
      },
    ),
  guests: yup.number().default(1).min(1).max(999).required(),
  comment: yup.string().default(""),
});

export type BookingFormValues = yup.InferType<typeof bookingSchema>;
