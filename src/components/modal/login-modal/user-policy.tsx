"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { getPrivacyPolicy } from "@/apis/auth";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useGeneral } from "@/hooks/useGeneral";
import { useAuthStore } from "@/stores/auth";
import type { PrivacyPolicyProps } from "@/types/auth";
import type { LocaleProps } from "@/types/i18n";
import { openExternalLink } from "@/utils/telegram";

const isTelegram = () =>
  typeof window !== "undefined" &&
  Boolean(
    (window as { Telegram?: { WebApp?: { initData?: string } } }).Telegram
      ?.WebApp?.initData,
  );

// Same PDF selection as the old webapp: user_policy_{telegram|website}_{locale};
// the backend only ships uz/ru, so other locales fall back to uz.
const getPolicyUrl = (data: PrivacyPolicyProps, locale: LocaleProps) => {
  const platform = isTelegram() ? "telegram" : "website";

  return data[`user_policy_${platform}_${locale}`] ?? data[`user_policy_${platform}_uz`];
};

type UserPolicyProps = {
  buttonLabel: string;
};

export const UserPolicy = ({ buttonLabel }: UserPolicyProps) => {
  const t = useTranslations();
  const locale = useLocale() as LocaleProps;
  const loginModal = useAuthStore((state) => state.loginModal);
  const { data: general } = useGeneral();
  const loginType = general?.data.login_type;

  const { data } = useQuery({
    queryKey: [REACT_QUERY_KEYS.PRIVACY_POLICY, loginType],
    queryFn: () => getPrivacyPolicy(loginType as string),
    enabled: loginModal && Boolean(loginType),
    staleTime: Infinity,
  });

  const url = data?.data ? getPolicyUrl(data.data, locale) : undefined;

  if (!url) return null;

  return (
    <p className="text-center text-xs font-normal leading-4 text-gray220">
      {t("login_policy_start", { button: buttonLabel })}{" "}
      <button
        type="button"
        onClick={() => openExternalLink(url)}
        className="cursor-pointer text-primary"
      >
        {t("login_policy_link")}
      </button>
      {t("login_policy_end")}
    </p>
  );
};
