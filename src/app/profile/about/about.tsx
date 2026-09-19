"use client";

import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { getBranches } from "@/apis/branches";
import BranchInfoSheet from "@/components/branch-info-sheet";
import type { BranchProps } from "@/types/branch";
import { getBranchLabel } from "@/app/[page]/components/branch-selection/utils";
import { WEEKDAYS } from "@/constants/weekdays";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopid } from "@/hooks/useShopId";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";

import ProfilePageShell from "../components/profile-page-shell";

const formatTime = (time: string) => time.slice(0, 5);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section
    data-about-section={title}
    className="rounded-2xl border border-gray180 bg-white p-4"
  >
    <h2 className="text-sm font-bold text-black">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

const LinesSkeleton = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-3 w-full rounded-full bg-gray10" />
    <div className="h-3 w-4/5 rounded-full bg-gray10" />
    <div className="h-3 w-2/3 rounded-full bg-gray10" />
  </div>
);

// Shop-wide data only — general (working_time, business_phone, socials) and
// the branch list, both already fetched elsewhere in the app.
const AboutContent = () => {
  const t = useTranslations();
  const { shopid, hasShopId } = useShopid();
  const { data: general, isLoading: isGeneralLoading } = useGeneral();
  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });
  // working_time keys are Monday=1 … Sunday=7.
  const [todayKey] = useState(() => String(new Date().getDay() || 7));
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
          <LinesSkeleton />
        ) : !workingTime ? (
          <p className="text-sm text-gray220">
            {t("profile_page.about.working_hours_empty")}
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
                  className={`flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 text-sm ${
                    isToday ? "bg-primary10 text-primary" : "text-gray220"
                  }`}
                >
                  <span className="shrink-0">
                    {t(`weekdays.${index + 1}`)}
                  </span>
                  {isClosed ? (
                    <span className="text-red">{t("common.closed")}</span>
                  ) : (
                    <span
                      className={`text-right ${isToday ? "text-primary" : "text-black"}`}
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

      <Section title={t("profile_page.about.branches")}>
        {isBranchesLoading ? (
          <LinesSkeleton />
        ) : branches.length === 0 ? (
          <p className="text-sm text-gray220">
            {t("profile_page.about.branches_empty")}
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
                    <MapPin size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-black">
                      {getBranchLabel(branch.name)}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray220">
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
        open={Boolean(infoBranch)}
        onClose={() => setInfoBranch(null)}
        branch={infoBranch}
        workingTime={workingTime}
      />

      <Section title={t("profile_page.about.contacts")}>
        {isGeneralLoading ? (
          <LinesSkeleton />
        ) : !phone && socials.length === 0 ? (
          <p className="text-sm text-gray220">
            {t("profile_page.about.contacts_empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 text-sm font-medium text-black"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
                  <Phone size={16} />
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
