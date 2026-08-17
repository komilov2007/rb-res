import { IconFacebook } from "@/icons/facebook-icon";
import { IconInstagram } from "@/icons/instagram-icon";
import { IconTelegram } from "@/icons/telegram-icon";
import { IconWhatsapp } from "@/icons/whatsupp-icon";
import { Globe2 } from "lucide-react";
import type { ComponentType } from "react";

type SocialIcon = ComponentType<{ size?: number }>;

export const formatSocialName = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export const getSocialIcon = (type: string): SocialIcon => {
  const name = type.toLowerCase();

  if (name.includes("instagram")) return IconInstagram;
  if (name.includes("telegram")) return IconTelegram;
  if (name.includes("whatsapp")) return IconWhatsapp;
  if (name.includes("facebook")) return IconFacebook;

  return Globe2;
};

export const getSocialStyle = (type: string) => {
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
