"use client";

import { useTranslations } from "next-intl";

import LanguageOptions from "../components/language-options";
import ProfilePageShell from "../components/profile-page-shell";

const Language = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("profile_page_language_sheet_title")}>
      <div className="flex max-w-md flex-col gap-2">
        <LanguageOptions />
      </div>
    </ProfilePageShell>
  );
};

export default Language;
