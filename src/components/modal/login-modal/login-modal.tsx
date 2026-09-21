"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import PhoneInput from "@/components/ui/phone-input";
import ModalScreen from "@/components/modal/screen-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useAuthStore } from "@/stores/auth";
import { loginUser } from "@/apis/auth";
import { setUser } from "@/utils/user";
import { useShopId } from "@/hooks/useShopId";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCartStore } from "@/stores/cart";
import { getCartList, postCartProductList } from "@/apis/cart";
import { normalizeCartItems } from "@/utils/cart";

const LoginModal = () => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");
  const loginModal = useAuthStore((state) => state.loginModal);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const setSignupModal = useAuthStore((state) => state.setSignupModal);
  const carts = useCartStore((state) => state.carts);
  const setCarts = useCartStore((state) => state.setCarts);

  const handleClose = () => {
    setPhone("");
    setLoginModal(false);
  };

  const login = useMutation({
    mutationFn: () =>
      loginUser({
        phone: `+998${phone}`,
        platform: "WEBSITE",
        shop: shopid as string,
      }),
    onSuccess: async (res) => {
      if (shopid) {
        setUser(shopid, res.data);
      }

      if (carts.length > 0) {
        // These are pre-login guest-cart items, which are always built
        // locally from the product's own parameter definitions (see
        // product-detail.tsx's handleAdd) — so they carry the full sku
        // object with an id, unlike the thinner {name, status, amount}
        // shape the authenticated card-list endpoint echoes back later.
        const syncPayload = carts.map((item) => ({
          product: item.product.id,
          parameter:
            item.parameter && "id" in item.parameter
              ? item.parameter.id
              : null,
          ad_parameter:
            item.ad_parameter
              ?.filter(
                (parameter): parameter is typeof parameter & { id: number } =>
                  "id" in parameter,
              )
              .map((parameter) => parameter.id) ?? [],
          quantity: item.quantity,
        }));

        try {
          await postCartProductList(res.data.customer, syncPayload);

          const cartListResponse = await getCartList(res.data.customer);
          queryClient.setQueryData(
            ["cart-list", res.data.customer],
            cartListResponse,
          );
          setCarts(normalizeCartItems(cartListResponse.data, carts));
        } catch {
          queryClient.invalidateQueries({
            queryKey: ["cart-list", res.data.customer],
          });
        }
      }

      // Auth is published only now, in the same tick as the name step opens,
      // so nothing reacting to hasAccess (e.g. the cart's resume-checkout
      // effect) runs while this modal or the cart sync above is still pending.
      // The cart sync itself authenticates via setUser's stored token.
      handleClose();
      setSignupModal(!(res.data.firstname && res.data.firstname.length > 0));
      setAuth(res.data);
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
          <h2 className="text-2xl font-bold text-black">{t("login")}</h2>
          <p className="mt-2 text-sm font-normal leading-5 text-gray220">
            {t("login_hint")}
          </p>
        </div>

        <XButton size="sm" onClick={handleClose} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-black">
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
      <Dialog open={loginModal} onOpenChange={() => setLoginModal(false)}>
        {/* z-[100] matches the mobile variant's ModalScreen below — both
            variants of this modal need to reliably sit above any other
            overlay (e.g. the cart drawer's Sheet), not just the shared
            Dialog primitive's default z-50, which the cart Sheet also
            uses. This was the actual cause of the login modal rendering
            untappable behind a still-open cart drawer. */}
        <DialogContent
          showCloseButton={false}
          className="z-[100] max-w-[420px] rounded-3xl border border-gray180 bg-white p-6"
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

