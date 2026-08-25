"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import Input from "@/components/ui/input";
import ModalScreen from "@/components/modal/screen-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useAuthStore } from "@/store/auth";
import { signUp } from "@/apis/auth";
import { useShopid } from "@/hooks/useShopId";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SignupModal = () => {
  const t = useTranslations();
  const { shopid } = useShopid();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [firstname, setFirstname] = useState("");
  const signupModal = useAuthStore((state) => state.signupModal);
  const setSignupModal = useAuthStore((state) => state.setSignupModal);

  const handleClose = () => {
    setFirstname("");
    setSignupModal(false)();
  };

  const signup = useMutation({
    mutationFn: () => signUp({ firstname }, shopid as string),
    onSuccess: () => {
      handleClose();
      void queryClient.invalidateQueries({ queryKey: ["general", shopid] });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shopid || !firstname.trim() || signup.isPending) return;

    signup.mutate();
  };

  const content = (
    <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-black">{t("signup")}</h2>
          <p className="mt-2 text-sm font-medium leading-5 text-gray220">
            {t("signup_hint")}
          </p>
        </div>

        <XButton size="sm" onClick={handleClose} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-black">{t("first_name")}</span>
        <Input
          value={firstname}
          onChange={(event) => setFirstname(event.target.value)}
          className="font-semibold text-black"
          wrapperClassName="max-h-12"
        />
      </label>

      <Button
        type="submit"
        variant="primary-solid"
        size="primaryWide"
        disabled={!shopid || !firstname.trim() || signup.isPending}
      >
        {t("continue")}
      </Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={signupModal} onOpenChange={setSignupModal(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[420px] rounded-3xl border border-gray180 bg-white p-6"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  if (!signupModal) return null;

  return (
    <ModalScreen onClose={handleClose} placement="bottom">
      {content}
    </ModalScreen>
  );
};

export default SignupModal;
