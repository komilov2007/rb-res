"use client";

import { useTranslations } from "next-intl";

import LanguageOptions from "../components/language-options";
import ProfilePageShell from "../components/profile-page-shell";

// Desktop sidebar's "Til" destination — its own page in the profile family
// (like addresses/notifications/about) instead of a dialog. Mobile's "Til"
// row still opens the LanguageSheet.
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
