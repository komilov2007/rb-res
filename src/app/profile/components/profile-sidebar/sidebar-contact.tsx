import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import type { GeneralProps } from "@/types/general";

import PoweredBy from "../powered-by";
import SocialLinks from "../social-links";

type SidebarContactProps = {
  businessPhone?: GeneralProps["business_phone"];
  socials: NonNullable<GeneralProps["socials"]>;
};

// The desktop sidebar's bottom card: shop phone, social links and the
// "Robosell.uz tomonidan taqdim etilgan" line. Renders nothing when the
// shop has neither a phone nor socials.
const SidebarContact = ({ businessPhone, socials }: SidebarContactProps) => {
  const t = useTranslations();

  if (!businessPhone && socials.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray180 bg-white p-3">
      {businessPhone && (
        <a
          href={`tel:${businessPhone}`}
          className="flex min-h-10 items-center gap-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray10 text-gray220">
            <MapPin size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal text-gray220">
              {t("profile_page_contact_label")}
            </p>
            <p className="truncate text-sm font-medium text-[#3D3D3D]">
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
