"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";

import EditProfileForm from "../components/edit-profile-form";
import ProfilePageShell from "../components/profile-page-shell";

const EditProfile = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("profile_page_menu_edit_profile")}>
      <Suspense>
        <EditProfileForm />
      </Suspense>
    </ProfilePageShell>
  );
};

export default EditProfile;
