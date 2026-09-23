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
    <h2 className="mb-2.5 flex items-center gap-2 text-sm font-medium text-black">
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
    <div className="flex min-h-0 flex-1 flex-col bg-gray10 lg:flex-auto">
      {/* Desktop: the window scrolls (no inner scroller) and, like the
          order page, two full-bleed white panels with an 8px gray gap —
          cards left (divided by lines instead of separate cards), sticky
          photo + summary right. Each panel pads its outer side by
          max(20px, 50% - 620px) so its content lines up with the header's
          max-w-7xl container. */}
      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto lg:flex lg:flex-auto lg:flex-col lg:overflow-visible">
        <div className="lg:flex lg:flex-1 lg:flex-row lg:gap-2 lg:py-2">
          <div className="lg:order-last lg:w-[calc(max(20px,50%-620px)+420px)] lg:shrink-0 lg:rounded-l-[30px] lg:bg-white lg:pl-6 lg:pr-[max(20px,calc(50%-620px))]">
            <aside className="lg:sticky lg:top-2 lg:flex lg:flex-col lg:gap-3 lg:py-5">
              <TwoHero />
              <TwoFooter className="hidden lg:block" />
            </aside>
          </div>

          <div className="relative z-10 mx-auto -mt-6 flex w-full max-w-xl flex-col gap-2 px-4 pb-2 lg:mx-0 lg:mt-0 lg:min-w-0 lg:max-w-none lg:flex-1 lg:gap-0 lg:rounded-r-[30px] lg:bg-white lg:py-2 lg:pl-[max(20px,calc(50%-620px))] lg:pr-6 lg:[&_section]:rounded-none lg:[&_section]:border-b lg:[&_section]:border-gray180 lg:[&_section]:px-0 lg:[&_section]:py-5 lg:[&_section:last-of-type]:border-b-0">
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
      </div>

      <TwoFooter className="lg:hidden" />
    </div>
  );
};

export default BookingTwo;
