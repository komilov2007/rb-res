"use client";

import Link from "next/link";

import { useGeneral } from "@/hooks/useGeneral";
import { IconClockFilled, IconPhoneFilled } from "@tabler/icons-react";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";
import { formatTime, getDayIndex } from "@/utils/working-time";
import { useTranslations } from "next-intl";

// Colour lives on an inner span: globals.css sets `a { color: inherit }`
// outside any layer, which overrides Tailwind text-* utilities on <a> itself.
const LINK_CLASS_NAME =
  "group flex items-center gap-1 whitespace-nowrap text-sm font-normal";
const LINK_TEXT_CLASS_NAME =
  "flex items-center gap-1 text-gray220 transition-colors group-hover:text-primary";

// Desktop-only (mobile has the bottom nav instead). Two rows: brand, links
// and contacts on top; a centred credit line under a divider — centred so
// the fixed Hand action button in the bottom-right corner never covers it.
const Footer = () => {
  const t = useTranslations();
  const { data } = useGeneral();
  const { shopid } = useShopId();
  const general = data?.data;
  const socials = general?.socials ?? [];
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";
  // Both point at the About page on purpose: it already renders the shop's
  // working hours, its branch list (live, from the branches API) and its
  // contacts — there is no separate branches route to link to. "Filiallar"
  // jumps straight to that page's branches section.
  const aboutHref = `${ROUTER.PROFILE_ABOUT}${shopQuery}`;
  const branchesHref = `${aboutHref}#branches`;
  const homeHref = `${ROUTER.HOME}${shopQuery}`;

  // Today's hours, same derivation as the branch picker drawer's schedule row.
  const todayEntry = general?.working_time?.[String(getDayIndex())];
  const todayHours =
    !todayEntry || todayEntry.is_closed || todayEntry.hours.length === 0
      ? t("common_closed")
      : todayEntry.hours
          .map((hour) => `${formatTime(hour.open)} - ${formatTime(hour.close)}`)
          .join(", ");

  return (
    <footer className="hidden rounded-t-[30px] border-t border-gray180 bg-white lg:block">
      <div className="mx-auto w-full max-w-7xl px-5">
        <div className="flex items-center justify-between gap-8 py-8">
          <div className="flex min-w-0 items-center gap-4">
            {/* Logo + name go home, like the header logo. */}
            <Link
              href={homeHref}
              aria-label={general?.name}
              className="flex shrink-0 items-center transition-opacity hover:opacity-80"
            >
              {general?.logo && (
                <img
                  src={general.logo}
                  alt={general.name}
                  className="h-14 w-14 object-contain"
                />
              )}
            </Link>
            <div className="min-w-0">
              <Link href={homeHref} className="block truncate text-base font-medium">
                <span className="text-black">{general?.name}</span>
              </Link>
              {general?.working_time && (
                <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[13px] font-normal text-gray220/70">
                  <IconClockFilled size={14} className="shrink-0" />
                  {t("location_branch_picker_schedule")}: {todayHours}
                </p>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            <Link className={LINK_CLASS_NAME} href={aboutHref}>
              <span className={LINK_TEXT_CLASS_NAME}>{t("about_us")}</span>
            </Link>
            <Link className={LINK_CLASS_NAME} href={branchesHref}>
              <span className={LINK_TEXT_CLASS_NAME}>
                {t("store_branches")}
              </span>
            </Link>
          </nav>

          <div className="flex shrink-0 flex-col items-end gap-3">
            {general?.business_phone && (
              <a
                href={`tel:${general.business_phone}`}
                className="group flex items-center gap-2 whitespace-nowrap text-base font-medium"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary10 text-primary">
                  <IconPhoneFilled size={15} />
                </span>
                <span className="text-black transition-colors group-hover:text-primary">
                  {general.business_phone}
                </span>
              </a>
            )}

            {socials.length > 0 && (
              <div className="flex gap-2">
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
                      className="flex h-9 w-9 items-center justify-center rounded-xl border transition-transform hover:-translate-y-0.5"
                      aria-label={formatSocialName(social.type)}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray180 py-5">
          <p className="text-center text-[13px] font-normal text-gray220/70">
            © {new Date().getFullYear()} {general?.name}
            <span className="mx-2 text-gray180">•</span>
            <a
              href="https://robosell.uz"
              target="_blank"
              rel="noreferrer"
              className="font-medium transition-opacity hover:opacity-75"
            >
              <span className="text-primary">Robosell.uz</span>
            </a>
            {` ${t("powered_by")}`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
