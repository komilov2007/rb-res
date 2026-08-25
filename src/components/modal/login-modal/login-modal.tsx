"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import PhoneInput from "@/components/ui/phone-input";
import ModalScreen from "@/components/modal/screen-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useAuthStore } from "@/store/auth";
import { loginUser } from "@/apis/auth";
import { setUser } from "@/lib/user";
import { useShopid } from "@/hooks/useShopId";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const LoginModal = () => {
  const t = useTranslations();
  const { shopid } = useShopid();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [phone, setPhone] = useState("");
  const loginModal = useAuthStore((state) => state.loginModal);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const setSignupModal = useAuthStore((state) => state.setSignupModal);

  const handleClose = () => {
    setPhone("");
    setLoginModal(false)();
  };

  const login = useMutation({
    mutationFn: () =>
      loginUser({
        phone: `+998${phone}`,
        platform: "WEBSITE",
        shop: shopid as string,
      }),
    onSuccess: (res) => {
      if (shopid) {
        setUser(shopid, res.data);
      }

      setAuth(res.data);
      handleClose();
      setSignupModal(!(res.data.firstname && res.data.firstname.length > 0))();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shopid || phone.length !== 9 || login.isPending) return;

    login.mutate();
  };

  const content = (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-black">{t("login")}</h2>
          <p className="mt-2 text-sm font-medium leading-5 text-gray220">
            {t("login_hint")}
          </p>
        </div>

        <XButton size="sm" onClick={handleClose} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-black">
          {t("phone_number")}
        </span>
        <PhoneInput autoFocus value={phone} onChange={setPhone} />
      </label>

      <Button
        type="submit"
        variant="primary-solid"
        size="primaryWide"
        disabled={!shopid || phone.length !== 9 || login.isPending}
      >
        {t("enter")}
      </Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={loginModal} onOpenChange={setLoginModal(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[420px] rounded-3xl border border-gray180 bg-white p-6"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  if (!loginModal) return null;

  return (
    <ModalScreen onClose={handleClose} placement="bottom">
      {content}
    </ModalScreen>
  );
};

export default LoginModal;
