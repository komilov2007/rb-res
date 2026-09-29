"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import Input from "@/components/ui/input";
import ModalScreen from "@/components/modal/screen-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { signUp } from "@/apis/auth";
import { getUser, setUser } from "@/utils/user";
import { useShopId } from "@/hooks/useShopId";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getLocalPhone } from "@/utils/format-number";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

// First-time user name step, opened right after login (or by checkout when
// the name is still missing) on top of the current screen. Saving the name
// updates auth, which is what lets a pending checkout continue.
const SignupModal = () => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [firstname, setFirstname] = useState("");
  const auth = useAuthStore((state) => state.auth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const signupModal = useAuthStore((state) => state.signupModal);
  const setSignupModal = useAuthStore((state) => state.setSignupModal);
  const setPendingCheckout = useCartStore((state) => state.setPendingCheckout);

  const closeModal = () => {
    setFirstname("");
    setSignupModal(false);
  };

  // Dismissed without a name: the user stays where they are and any pending
  // checkout is dropped instead of continuing to the order page.
  const handleDismiss = () => {
    setPendingCheckout(false);
    closeModal();
  };

  const signup = useMutation({
    mutationFn: () =>
      signUp(
        { firstname: firstname.trim(), phone: getLocalPhone(auth?.phone) },
        shopid as string,
      ),
    onSuccess: (response) => {
      // The stored session, not the render-time `auth`: the request may
      // have refreshed the tokens on its way out.
      const currentAuth = (shopid && getUser(shopid)?.auth) || auth;

      if (currentAuth) {
        const nextAuth = { ...currentAuth, firstname: response.data.firstname };

        setAuth(nextAuth);

        if (shopid) setUser(shopid, nextAuth);
      }

      closeModal();
      void queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.GENERAL, shopid],
      });
      void queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.PROFILE],
      });
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
          <h2 className="text-2xl font-medium text-black">{t("signup")}</h2>
          <p className="mt-2 text-sm font-normal leading-5 text-gray220">
            {t("signup_hint")}
          </p>
        </div>

        <XButton size="sm" onClick={handleDismiss} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-black">
          {t("first_name")}
        </span>
        <Input
          autoFocus
          value={firstname}
          onChange={(event) => setFirstname(event.target.value)}
          className="font-normal text-black"
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
      <Dialog
        open={signupModal}
        onOpenChange={(open) => !open && handleDismiss()}
      >
        <DialogContent
          showCloseButton={false}
          className="z-[100] max-w-[420px] rounded-3xl border border-gray180 bg-white p-6"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  if (!signupModal) return null;

  return (
    <ModalScreen onClose={handleDismiss} placement="bottom">
      {content}
    </ModalScreen>
  );
};

export default SignupModal;
