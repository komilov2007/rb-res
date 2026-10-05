"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useGeneral } from "@/hooks/useGeneral";
import { useShopStatusStore } from "@/stores/shop-status";
import { ClickProvider } from "@/provider/click";
import { isClick } from "@/utils/click";

type GeneralProviderProps = {
  clickToken: string | null;
  children: ReactNode;
};

export const GeneralProvider = ({
  clickToken,
  children,
}: GeneralProviderProps) => {
  const { data } = useGeneral();
  const isOpen = data?.data.is_open;
  const openClosedModal = useShopStatusStore((state) => state.openClosedModal);
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (prevIsOpenRef.current !== false && isOpen === false) {
      openClosedModal();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, openClosedModal]);

  return (
    <>
      {isClick() && <ClickProvider clickToken={clickToken} />}
      {children}
    </>
  );
};
