"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import TwoComment from "./components/two-comment";
import TwoContact from "./components/two-contact";
import TwoFooter from "./components/two-footer";
import TwoGuests from "./components/two-guests";
import TwoHero from "./components/two-hero";
import TwoVisit from "./components/two-visit";

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-xl bg-white p-3">
    <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-black">
      <span className="h-4 w-1 rounded-full bg-primary" />
      {title}
    </h2>
    {children}
  </section>
);

// Variant "two": white + primary only, no blur. An atmosphere photo on top
// (no text over it), white cards overlapping it, every field drawn as the
// same tile (TwoField), and a footer with a live summary of the picks.
const BookingTwo = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray10">
      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto">
        <TwoHero />

        <div className="relative z-10 mx-auto -mt-6 flex w-full max-w-xl flex-col gap-2 px-4 pb-4">
          <Card title={t("booking_section_contact")}>
            <TwoContact />
          </Card>
          <Card title={t("booking_section_visit")}>
            <div className="flex flex-col gap-2">
              <TwoVisit />
              <TwoGuests />
            </div>
          </Card>
          <Card title={t("booking_leave_comment")}>
            <TwoComment />
          </Card>
        </div>
      </div>

      <TwoFooter />
    </div>
  );
};

export default BookingTwo;
