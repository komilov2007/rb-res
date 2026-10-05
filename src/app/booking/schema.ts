import * as yup from "yup";

import { getDateValue } from "@/utils/format-date";
import { translate } from "@/utils/translate";

import { BOOKING_MAX_GUESTS, BOOKING_MIN_GUESTS } from "./constants";
import {
  isDayOff,
  isIsoDate,
  isPastSlot,
  isTime,
  isWithinWorkingHours,
  type WorkingTime,
} from "./utils";

export type BookingSchemaContext = { workingTime?: WorkingTime };

const PHONE_LENGTH = 9;

const isFullPhone = (value?: string) => value?.length === PHONE_LENGTH;

export const bookingSchema = yup.object({
  name: yup.string().default(""),
  phone: yup.string().default(""),
  extra_phone: yup
    .string()
    .default("")
    .test(
      "full-phone",
      () => translate("booking_errors_phone_invalid"),
      (value) => !value || isFullPhone(value),
    ),
  date: yup
    .string()
    .default("")
    .required(() => translate("booking_errors_date_required"))
    .test(
      "valid",
      () => translate("booking_errors_date_invalid"),
      (value) => !value || isIsoDate(value),
    )
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

        if (!value || !isTime(value) || !date || !isIsoDate(date)) return true;
        if (isDayOff(workingTime, date)) return true;

        return isWithinWorkingHours(workingTime, date, value);
      },
    ),
  guests: yup
    .number()
    .default(BOOKING_MIN_GUESTS)
    .min(BOOKING_MIN_GUESTS)
    .max(BOOKING_MAX_GUESTS)
    .required(),
  comment: yup.string().default(""),
});

export type BookingFormValues = yup.InferType<typeof bookingSchema>;
