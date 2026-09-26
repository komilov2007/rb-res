"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import BookingSummary from "../booking-summary";
import ContactFields from "../contact-fields";
import GuestsComment from "../guests-comment";
import VisitTime from "../visit-time";

// One numbered step: a badge on a vertical rail, the section beside it.
// The shared sections are cards on mobile, so their own padding/background
// is dropped here — the white page panel is the card on desktop.
const Step = ({
  number,
  isLast = false,
  children,
}: {
  number: number;
  isLast?: boolean;
  children: ReactNode;
}) => (
  <div className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-5">
    <div className="flex flex-col items-center">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary10 text-sm font-medium text-primary">
        {number}
      </span>
      {!isLast && <span className="mt-2 w-px flex-1 bg-gray180" />}
    </div>
    <div
      className={`min-w-0 [&>section]:rounded-none [&>section]:bg-transparent [&>section]:p-0 ${isLast ? "" : "pb-9"}`}
    >
      {children}
    </div>
  </div>
);

// Desktop /booking: a heading and the form as three numbered steps on the
// left, the summary card (photo, live picks, submit) on the right, the
// same height as the form column.
// Uses the same field components (and form) as the mobile layout.
const BookingDesktop = () => {
  const t = useTranslations();

  return (
    <section className="my-2 flex-1 rounded-[30px] bg-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_440px] items-stretch gap-10 px-5 py-10">
        <div className="min-w-0">
          <h1 className="text-[34px] font-medium leading-tight text-black">
            {t("booking_form_title")}
          </h1>

          <div className="mt-8">
            <Step number={1}>
              <ContactFields />
            </Step>
            <Step number={2}>
              <VisitTime />
            </Step>
            <Step number={3} isLast>
              <GuestsComment />
            </Step>
          </div>
        </div>

        <BookingSummary />
      </div>
    </section>
  );
};

export default BookingDesktop;
