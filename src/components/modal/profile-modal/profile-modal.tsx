"use client";

import { LogOut, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import ModalScreen from "@/components/modal/screen-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { clearUser } from "@/lib/user";
import { useShopid } from "@/hooks/useShopId";
import { useAuthStore } from "@/store/auth";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ProfileModal = () => {
  const t = useTranslations();
  const { shopid } = useShopid();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const auth = useAuthStore((state) => state.auth);
  const logout = useAuthStore((state) => state.logout);
  const profileModal = useAuthStore((state) => state.profileModal);
  const setProfileModal = useAuthStore((state) => state.setProfileModal);

  const handleClose = () => {
    setProfileModal(false)();
  };

  const handleLogout = () => {
    clearUser(shopid);
    logout();
  };

  const content = (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-black">{t("profile")}</h2>
        </div>

        <XButton size="sm" onClick={handleClose} />
      </div>

      <div className="rounded-3xl border  p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
            <User size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-black">
              {auth?.firstname}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray220">
              <Phone size={15} />
              {auth?.phone}
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        size="primaryWide"
        onClick={handleLogout}
      >
        <LogOut size={19} />
        {t("logout")}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={profileModal} onOpenChange={setProfileModal(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[420px] rounded-3xl border border-gray180 bg-white p-6"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  if (!profileModal) return null;

  return (
    <ModalScreen onClose={handleClose} placement="bottom">
      {content}
    </ModalScreen>
  );
};

export default ProfileModal;
