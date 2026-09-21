"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";

import EditProfileForm from "../components/edit-profile-form";
import ProfilePageShell from "../components/profile-page-shell";

// Was a modal (EditNameModal) — now its own page under the profile family
// of routes, navigated to and from like addresses/notifications/about
// instead of opening as an overlay.
const EditProfile = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("profile_page_menu_edit_profile")} showDesktopBack>
      {/* useSearchParams (shop_id) needs a Suspense boundary. */}
      <Suspense>
        <EditProfileForm />
      </Suspense>
    </ProfilePageShell>
  );
};

export default EditProfile;
