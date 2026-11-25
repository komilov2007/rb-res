"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { updateOferta } from "@/apis/oferta";
import { ROUTER } from "@/constants/router";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { setUser } from "@/utils/user";

// Forced public-offer acceptance for a freshly registered user (auth.is_new),
// hidden while the user is reading the offer page itself.
const OfertaModal = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { shopid } = useShopId();
  const { data: general } = useGeneral();
  const auth = useAuthStore((state) => state.auth);
  const setAuth = useAuthStore((state) => state.setAuth);
  // Wait until the post-login name step is done so two dialogs never stack.
  const signupModal = useAuthStore((state) => state.signupModal);
  const [checked, setChecked] = useState(false);

  const accept = useMutation({
    mutationFn: () => updateOferta(shopid as string),
    onSuccess: () => {
      if (!auth) return;

      const nextAuth = { ...auth, is_new: false };

      if (shopid) setUser(shopid, nextAuth);
      setAuth(nextAuth);
    },
  });

  const open =
    Boolean(auth?.access && auth.is_new) &&
    !signupModal &&
    !pathname?.startsWith(ROUTER.OFERTA);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[100]"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="z-[100] max-h-[calc(100dvh-var(--safe-top)-var(--safe-bottom)-2rem)] max-w-[420px] gap-4 overflow-y-auto rounded-3xl border border-gray180 bg-white p-6 text-black"
      >
        <DialogTitle className="text-center text-lg font-medium text-black">
          {t("oferta_title")}
        </DialogTitle>

        <DialogDescription asChild>
          <div className="flex flex-col gap-2 text-sm font-normal text-gray220">
            {general?.data.name && (
              <p className="border-b border-gray180 pb-2">
                {t("oferta_company", { company: general.data.name })}
              </p>
            )}
            <p>{t("oferta_description")}</p>
          </div>
        </DialogDescription>

        <label className="flex cursor-pointer items-start gap-2 text-xs leading-4 text-black">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
          />
          <span>
            {t("oferta_agree_label")}{" "}
            <Link
              href={`${ROUTER.OFERTA}${shopid ? `?shop_id=${shopid}` : ""}`}
              className="text-primary"
            >
              {t("oferta")}
            </Link>
          </span>
        </label>

        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          disabled={!checked || !shopid || accept.isPending}
          onClick={() => accept.mutate()}
        >
          {t("oferta_accept")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OfertaModal;
