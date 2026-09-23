"use client";

import Link from "next/link";

import { useGeneral } from "@/hooks/useGeneral";
import { ExternalLink } from "lucide-react";
import { IconPhoneFilled } from "@tabler/icons-react";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";
import { useTranslations } from "next-intl";

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

  return (
    <footer className="hidden h-[204px] items-center justify-center rounded-t-[30px] border-t border-[#EAECF0] bg-white px-5 lg:flex">
      <div className="grid w-full max-w-7xl grid-cols-[1.25fr_0.9fr_1fr] items-center">
        <div className="flex items-center gap-5 pr-10">
          {general?.logo && (
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray180 bg-white">
              <img
                src={general.logo}
                alt={general.name}
                className="h-full w-full object-contain p-2"
              />
            </div>
          )}

          <nav className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Link
              className="text-sm font-normal text-gray220 transition-colors hover:text-black"
              href={aboutHref}
            >
              {t("about_us")}
            </Link>
            <Link
              className="text-sm font-normal text-gray220 transition-colors hover:text-black"
              href={branchesHref}
            >
              {t("store_branches")}
            </Link>
            <a
              className="text-sm font-normal text-gray220 transition-colors hover:text-black"
              href="#"
            >
              {t("privacy_policy")}
            </a>
            <a
              className="flex items-center gap-1 text-sm font-normal text-gray220 transition-colors hover:text-black"
              href="#"
            >
              {t("terms")}
              <ExternalLink size={14} />
            </a>
          </nav>
        </div>

        <div className="flex h-[92px] items-center justify-center border-x border-[#EAECF0] px-10">
          <p className="text-center text-sm font-normal text-gray220">
            <span className="font-medium text-black">Robosell.uz</span>
            {` ${t("powered_by")}`}
          </p>
        </div>

        <div className="flex flex-col items-end pl-10">
          {general?.business_phone && (
            <a
              href={`tel:${general.business_phone}`}
              className="flex items-center gap-2 text-base font-medium text-black transition-opacity hover:opacity-70"
            >
              <IconPhoneFilled size={17} className="text-gray220" />
              {general.business_phone}
            </a>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2.5">
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
                  className="flex h-11 w-11 items-center justify-center rounded-xl border transition-opacity hover:opacity-75"
                  aria-label={formatSocialName(social.type)}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
