"use client";

import { Suspense, useState } from "react";
import { ChevronRight } from "lucide-react";
import { IconMapPinFilled, IconPhoneFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import BranchInfoSheet from "@/components/branch-info-sheet";
import type { BranchProps } from "@/types/branch";
import { getBranchLabel } from "@/components/branch-selection/utils";
import { WEEKDAYS } from "@/constants/weekdays";
import { useGeneral } from "@/hooks/useGeneral";
import { useBranches } from "@/hooks/useBranches";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";

import { formatTime, getDayIndex } from "@/utils/working-time";

import ProfilePageShell from "../components/profile-page-shell";

const Section = ({
  id,
  title,
  children,
}: {
  // Set only where something links straight to a section (the footer's
  // "Filiallar" jumps to #branches); the rest stay anchorless.
  id?: string;
  title: string;
  children: React.ReactNode;
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

// Loading placeholders sized like each section's real rows, so nothing
// jumps when the data lands.
const WorkingTimeSkeleton = () => (
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

const BranchesSkeleton = () => (
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

const ContactsSkeleton = () => (
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

// Shop-wide data only — general (working_time, business_phone, socials) and
// the branch list, both already fetched elsewhere in the app.
const AboutContent = () => {
  const t = useTranslations();
  const { data: general, isLoading: isGeneralLoading } = useGeneral();
  const { data: branchesData, isLoading: isBranchesLoading } = useBranches();
  // working_time keys are Monday=1 … Sunday=7.
  const [todayKey] = useState(() => String(getDayIndex()));
  // Same read-only branch info + map sheet the order detail page opens.
  const [infoBranch, setInfoBranch] = useState<BranchProps | null>(null);

  const shop = general?.data;
  const workingTime = shop?.working_time;
  const branches =
    branchesData?.data.filter((branch) => branch.is_active) ?? [];
  const socials = shop?.socials ?? [];
  const phone = shop?.business_phone;

  return (
    <>
      <Section title={t("work_time")}>
        {isGeneralLoading ? (
          <WorkingTimeSkeleton />
        ) : !workingTime ? (
          <p className="text-sm text-gray220">
            {t("profile_page_about_working_hours_empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {WEEKDAYS.map((day, index) => {
              const key = String(index + 1);
              const entry = workingTime[key];
              const isToday = key === todayKey;
              const isClosed =
                !entry || entry.is_closed || entry.hours.length === 0;

              return (
                <li
                  key={day}
                  data-weekday={key}
                  className={`flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 ${
                    isToday ? "bg-primary10" : ""
                  }`}
                >
                  <span
                    className={`info-label shrink-0 ${isToday ? "text-primary" : ""}`}
                  >
                    {t(`weekdays_${index + 1}`)}
                  </span>
                  {isClosed ? (
                    <span className="text-[13px] font-normal text-red">
                      {t("common_closed")}
                    </span>
                  ) : (
                    <span
                      className={`text-right text-[13px] font-medium ${isToday ? "text-primary" : "text-gray220/70"}`}
                    >
                      {entry.hours.map((hour, hourIndex) => (
                        <span key={hourIndex} className="block">
                          {formatTime(hour.open)} – {formatTime(hour.close)}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section id="branches" title={t("profile_page_about_branches")}>
        {isBranchesLoading ? (
          <BranchesSkeleton />
        ) : branches.length === 0 ? (
          <p className="text-sm text-gray220">
            {t("profile_page_about_branches_empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {branches.map((branch) => (
              <li key={branch.id} data-about-branch={branch.id}>
                <button
                  type="button"
                  onClick={() => setInfoBranch(branch)}
                  className="flex w-full items-start gap-3 rounded-xl px-1 py-1.5 text-left transition-colors active:bg-gray10"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
                    <IconMapPinFilled size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="info-label block">
                      {getBranchLabel(branch.name)}
                    </span>
                    <span className="info-value block">
                      {branch.address}
                    </span>
                  </span>
                  <ChevronRight
                    size={18}
                    className="mt-2 shrink-0 text-gray220"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <BranchInfoSheet
        desktop="drawer"
        open={Boolean(infoBranch)}
        onClose={() => setInfoBranch(null)}
        branch={infoBranch}
        workingTime={workingTime}
      />

      <Section title={t("profile_page_about_contacts")}>
        {isGeneralLoading ? (
          <ContactsSkeleton />
        ) : !phone && socials.length === 0 ? (
          <p className="text-sm text-gray220">
            {t("profile_page_about_contacts_empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 text-sm font-medium text-black"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
                  <IconPhoneFilled size={16} />
                </span>
                {phone}
              </a>
            )}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socials.map((social) => {
                  const Icon = getSocialIcon(social.type);
                  const style = getSocialStyle(social.type);

                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: style.color,
                        borderColor: style.borderColor,
                        backgroundColor: style.backgroundColor,
                      }}
                      className="flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium"
                    >
                      <Icon size={16} />
                      {formatSocialName(social.type)}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
};

const About = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("about_us")}>
      {/* useSearchParams (shop_id) needs a Suspense boundary. */}
      <Suspense>
        <AboutContent />
      </Suspense>
    </ProfilePageShell>
  );
};

export default About;
