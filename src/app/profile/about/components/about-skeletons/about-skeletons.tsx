import { WEEKDAYS } from "@/constants/weekdays";
import type { ReactNode } from "react";

export const WorkingTimeSkeleton = () => (
  <ul className="flex flex-col gap-1">
    {WEEKDAYS.map((day) => (
      <li
        key={day}
        className="flex h-8 items-center justify-between gap-3 px-2"
      >
        <span className="skeleton h-3.5 w-20 rounded-full" />
        <span className="skeleton h-3.5 w-24 rounded-full" />
      </li>
    ))}
  </ul>
);

export const BranchesSkeleton = () => (
  <ul className="flex flex-col gap-2">
    {Array.from({ length: 2 }).map((_, index) => (
      <li key={index} className="flex items-start gap-3 px-1 py-1.5">
        <span className="skeleton h-9 w-9 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1">
          <span className="skeleton block h-4 w-32 rounded-full" />
          <span className="skeleton mt-1.5 block h-3 w-48 max-w-full rounded-full" />
        </span>
      </li>
    ))}
  </ul>
);

export const ContactsSkeleton = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <span className="skeleton h-9 w-9 shrink-0 rounded-full" />
      <span className="skeleton h-4 w-32 rounded-full" />
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <span key={index} className="skeleton h-9 w-24 rounded-full" />
      ))}
    </div>
  </div>
);

const AboutSection = ({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) => (
  <section
    id={id}
    data-about-section={title}
    className="rounded-2xl border border-gray180 bg-white p-4 lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:pb-5 lg:pt-3 lg:first-of-type:pt-0 lg:last-of-type:border-b-0 lg:last-of-type:pb-0"
  >
    <h2 className="text-sm font-medium text-black">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

export { AboutSection };
