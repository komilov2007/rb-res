"use client";

import { useState } from "react";
import {
  ArrowRight,
  MessageSquareText,
  Minus,
  Phone,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import { formatPhone } from "@/utils/format-number";

import DatePicker from "./components/date-picker";
import Field from "./components/field";
import PhoneStart from "./components/phone-start";
import TimePicker from "./components/time-picker";
import { inputClassName, inputTextClassName } from "./constants";
import { handlePhoneInput } from "./utils";

const BookingForm = () => {
  const t = useTranslations();
  const [showOptionalPhone, setShowOptionalPhone] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const handleSubmit = () => {
    if (!hasAccess) {
      setLoginModal(true);
    }
  };

  return (
    <div className="py-2 lg:py-8">
      <form className="mx-auto grid w-full overflow-hidden rounded-[22px] border border-gray180/70 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.10)] lg:grid-cols-[0.9fr_1fr]">
        <div className="relative max-h-[600px] overflow-hidden bg-black lg:h-full">
          <img
            src="/booking.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/5" />
          <div className="absolute left-5 right-5 top-6 text-white lg:left-10 lg:right-10 lg:top-10">
            <span className="mb-4 block h-1 w-10 rounded-full bg-white" />
            <h2 className="max-w-md text-2xl font-bold leading-tight lg:text-4xl">
              {t("booking_form_title")}
            </h2>
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-white/90 lg:text-base lg:leading-7">
              {t("booking_form_subtitle")}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-white to-gray10/80 p-4 lg:p-6">
          <div className="h-full rounded-[18px] border border-white bg-white/90 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-6">
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-gray180/70 bg-white px-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray220">
                    {t("first_name")}
                  </p>
                  <p className="truncate text-sm font-medium text-black">
                    {hasAccess
                      ? auth?.firstname || t("booking_user_fallback")
                      : t("booking_login_required")}
                  </p>
                </div>
              </div>

              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-gray180/70 bg-white px-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray220">
                    {t("phone_number")}
                  </p>
                  <p className="truncate text-sm font-medium text-black">
                    {hasAccess && auth?.phone
                      ? `+998 ${formatPhone(auth.phone)}`
                      : t("booking_login_required")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2 lg:gap-4">
              <Field label={t("booking_date")}>
                <DatePicker
                  value={date}
                  month={calendarMonth}
                  onChange={setDate}
                  onChangeMonth={setCalendarMonth}
                />
              </Field>

              <Field label={t("booking_time")}>
                <TimePicker
                  value={time}
                  onChange={setTime}
                  placeholder={t("booking_select_time")}
                />
              </Field>

              <Field label={t("booking_guests")}>
                <div className={`${inputClassName} justify-between`}>
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-gray220" />
                    <span className="text-sm font-medium text-black">
                      {guestCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="clear"
                      size="clear"
                      onClick={() =>
                        setGuestCount((count) => Math.max(1, count - 1))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray10 text-black"
                    >
                      <Minus size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="clear"
                      size="clear"
                      onClick={() =>
                        setGuestCount((count) => Math.min(999, count + 1))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray10 text-black"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </Field>

              {showOptionalPhone ? (
                <Field
                  label={t("booking_extra_phone")}
                  badge={t("booking_optional")}
                  className="lg:col-span-2"
                >
                  <Input
                    inputMode="numeric"
                    onInput={handlePhoneInput}
                    placeholder={t("booking_optional_phone_placeholder")}
                    wrapperClassName={inputClassName}
                    className={inputTextClassName}
                    startContent={<PhoneStart />}
                    endContent={
                      <Button
                        type="button"
                        variant="clear"
                        size="clear"
                        onClick={() => setShowOptionalPhone(false)}
                      >
                        <X size={14} strokeWidth={2.4} />
                      </Button>
                    }
                  />
                </Field>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowOptionalPhone(true)}
                  className="flex w-fit items-center gap-2 text-sm font-medium text-black lg:col-span-2"
                >
                  <Plus size={17} />
                  {t("booking_add_extra_phone")}
                </button>
              )}

              <Field label={t("booking_leave_comment")} className="lg:col-span-2">
                <div className="flex min-h-20 rounded-2xl border border-gray180/80 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] focus-within:border-black lg:min-h-24">
                  <MessageSquareText
                    size={20}
                    className="mr-3 shrink-0 text-gray220"
                  />
                  <textarea
                    placeholder={t("booking_comment_placeholder")}
                    // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
                    className="min-h-14 w-full resize-none bg-transparent text-base font-normal text-black outline-none placeholder:text-gray220 lg:min-h-18"
                  />
                </div>
              </Field>
            </div>

            <Button
              type="button"
              variant="primary-solid"
              size="primaryWide"
              onClick={handleSubmit}
              className="mt-4 h-12 w-full rounded-xl text-base"
            >
              {t("booking_submit")}
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

