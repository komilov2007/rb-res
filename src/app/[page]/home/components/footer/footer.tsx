import { useGeneral } from "@/hooks/useGeneral";
import { ExternalLink, Globe2, Phone } from "lucide-react";
import type { ComponentType } from "react";

const Footer = () => {
  const { data } = useGeneral();
  const general = data?.data;
  const socials = general?.socials ?? [];

  return (
    <footer className="hidden h-[204px] items-center justify-center border-t border-[#EAECF0] bg-white px-5 lg:flex">
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
            <a
              className="text-sm font-semibold text-gray220 transition-colors hover:text-black"
              href="#"
            >
              Biz haqimizda
            </a>
            <a
              className="text-sm font-semibold text-gray220 transition-colors hover:text-black"
              href="#"
            >
              {"Do'kon filiallari"}
            </a>
            <a
              className="text-sm font-semibold text-gray220 transition-colors hover:text-black"
              href="#"
            >
              Maxfiylik siyosati
            </a>
            <a
              className="flex items-center gap-1 text-sm font-semibold text-gray220 transition-colors hover:text-black"
              href="#"
            >
              Foydalanish shartlari
              <ExternalLink size={14} />
            </a>
          </nav>
        </div>

        <div className="flex h-[92px] items-center justify-center border-x border-[#EAECF0] px-10">
          <p className="text-center text-sm font-semibold text-gray220">
            <span className="font-extrabold text-primary">Robosell.uz</span>{" "}
            tomonidan taqdim etilgan
          </p>
        </div>

        <div className="flex flex-col items-end pl-10">
          {general?.business_phone && (
            <a
              href={`tel:${general.business_phone}`}
              className="flex items-center gap-2 text-base font-extrabold text-black transition-opacity hover:opacity-70"
            >
              <Phone size={17} className="text-primary" />
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

const formatSocialName = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const getSocialIcon = (type: string) => {
  const name = type.toLowerCase();

  if (name.includes("instagram")) return IconInstagram;
  if (name.includes("telegram")) return IconTelegram;
  if (name.includes("whatsapp")) return IconWhatsapp;
  if (name.includes("facebook")) return IconFacebook;

  return Globe2;
};

const getSocialStyle = (type: string) => {
  const name = type.toLowerCase();

  if (name.includes("instagram")) {
    return {
      color: "#E1306C",
      borderColor: "rgba(225, 48, 108, 0.22)",
      backgroundColor: "rgba(225, 48, 108, 0.06)",
    };
  }

  if (name.includes("telegram")) {
    return {
      color: "#229ED9",
      borderColor: "rgba(34, 158, 217, 0.22)",
      backgroundColor: "rgba(34, 158, 217, 0.06)",
    };
  }

  if (name.includes("facebook")) {
    return {
      color: "#1877F2",
      borderColor: "rgba(24, 119, 242, 0.22)",
      backgroundColor: "rgba(24, 119, 242, 0.06)",
    };
  }

  if (name.includes("whatsapp")) {
    return {
      color: "#25D366",
      borderColor: "rgba(37, 211, 102, 0.22)",
      backgroundColor: "rgba(37, 211, 102, 0.06)",
    };
  }

  return {
    color: "#111111",
    borderColor: "#EAECF0",
    backgroundColor: "#FFFFFF",
  };
};

type SocialIconProps = {
  size?: number;
};

const IconInstagram: ComponentType<SocialIconProps> = ({ size = 19 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" />
    </svg>
  );
};

const IconTelegram: ComponentType<SocialIconProps> = ({ size = 19 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 4.8 17.9 20c-.2 1-1.1 1.2-1.9.7l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.1 13.9 1.5 12.5c-1-.3-1-1 .2-1.5L19.8 4c.8-.3 1.5.2 1.2.8Z"
        fill="currentColor"
      />
    </svg>
  );
};

const IconWhatsapp: ComponentType<SocialIconProps> = ({ size = 19 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 20.2 6.1 16A8 8 0 1 1 9 18.9l-4 1.3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 8.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.4.5c-.1.2-.2.3-.1.5.4.8 1.1 1.5 2 2 .2.1.3 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .5-.3 1.4-1 1.7-.6.3-1.6.3-3-.4-2.6-1.1-4.3-3.5-4.6-4-.3-.5-1-1.8-.4-2.9Z"
        fill="currentColor"
      />
    </svg>
  );
};

const IconFacebook: ComponentType<SocialIconProps> = ({ size = 19 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 8.2V6.9c0-.6.4-.9 1-.9h1.8V3h-2.6C11.5 3 10 4.6 10 7.2v1H8v3.1h2V21h3.3v-9.7h2.7l.5-3.1H13.3Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Footer;
