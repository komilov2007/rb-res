import { IconPhoneFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { GeneralProps } from "@/types/general";

import PoweredBy from "../powered-by";
import SocialLinks from "../social-links";

type SidebarContactProps = {
  businessPhone?: GeneralProps["business_phone"];
  socials: NonNullable<GeneralProps["socials"]>;
};

// The desktop sidebar's bottom section: shop phone, social links and the
// "Robosell.uz tomonidan taqdim etilgan" line. Renders nothing when the
// shop has neither a phone nor socials.
const SidebarContact = ({ businessPhone, socials }: SidebarContactProps) => {
  const t = useTranslations();

  if (!businessPhone && socials.length === 0) return null;

  return (
    <div className="px-2 py-3">
      {businessPhone && (
        <a
          href={`tel:${businessPhone}`}
          className="flex min-h-10 items-center gap-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray10 text-gray220">
            <IconPhoneFilled size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="info-label">
              {t("profile_page_contact_label")}
            </p>
            <p className="info-value truncate">
              {businessPhone}
            </p>
          </div>
        </a>
      )}

      {socials.length > 0 && (
        <div className={businessPhone ? "mt-3" : ""}>
          <p className="text-xs font-medium text-black">
            {t("profile_page_socials_title")}
          </p>
          <SocialLinks
            socials={socials}
            itemClassName="flex h-10 w-10 items-center justify-center rounded-full border"
          />
        </div>
      )}
      <PoweredBy className="mt-3 text-sm font-normal text-gray220" />
    </div>
  );
};

export default SidebarContact;
