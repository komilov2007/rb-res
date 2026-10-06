import { IconPhoneFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { GeneralProps } from "@/types/general";
import { PoweredBy } from "@/app/profile/components/profile-desktop-layout";
import { SocialLinks } from "@/app/profile/components/profile-page-shell";
import type { ComponentType } from "react";
import { ChevronRight } from "lucide-react";

type SidebarContactProps = {
  businessPhone?: GeneralProps["business_phone"];
  socials: NonNullable<GeneralProps["socials"]>;
};

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

type SidebarRowProps = {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value?: string;
  active?: boolean;
  onClick: () => void;
};

const SidebarRow = ({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: SidebarRowProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={`group flex h-11 w-full shrink-0 items-center gap-3 rounded-xl px-2 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/40 ${
      active ? "bg-gray10 text-black" : "text-black hover:bg-gray10/60"
    }`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
        active
          ? "bg-white text-gray220"
          : "bg-gray10 text-gray220 group-hover:bg-white group-hover:text-black"
      }`}
    >
      <Icon size={16} />
    </span>
    <span className="min-w-0 flex-1 truncate text-sm font-normal">
      {label}
    </span>
    {value && (
      <span className="max-w-25 truncate text-[13px] font-medium text-gray220/70">
        {value}
      </span>
    )}
    <ChevronRight
      size={17}
      className={`shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
        active ? "text-gray220" : "text-gray180 group-hover:text-gray220"
      }`}
    />
  </button>
);

export const SIDEBAR_GROUP_CLASS_NAME =
  "flex flex-col gap-0.5 py-3";

export { SidebarContact, SidebarRow };

export default SidebarContact;
