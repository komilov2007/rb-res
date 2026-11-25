"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { isAxiosError } from "axios";

import { postBotError } from "@/apis/general";
import { FatalError } from "@/components/fatal-error";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { useShopStatusStore } from "@/stores/shop-status";
import { ClickProvider } from "@/provider/click";
import { isClick } from "@/utils/click";
import { clearUser } from "@/utils/user";

type GeneralProviderProps = {
  clickToken: string | null;
  children: ReactNode;
};

// Missing shop (404) keeps the NotFound page; network/5xx is fatal.
const isFatalGeneralError = (error: unknown) => {
  if (!error) return false;
  if (!isAxiosError(error)) return true;

  const status = error.response?.status;

  return !status || status >= 500;
};

const getErrorText = (error: unknown, shopid?: string) => {
  const details = isAxiosError(error)
    ? (error.response?.data ?? error.message)
    : String(error);

  return JSON.stringify({
    source: "GENERAL api",
    shop_id: shopid ?? null,
    domain: typeof window !== "undefined" ? window.location.host : null,
    text: details,
  });
};

export const GeneralProvider = ({
  clickToken,
  children,
}: GeneralProviderProps) => {
  const { data, error } = useGeneral();
  const { shopid } = useShopId();
  const isOpen = data?.data.is_open;
  const openClosedModal = useShopStatusStore((state) => state.openClosedModal);
  const prevIsOpenRef = useRef(isOpen);
  const reportedRef = useRef(false);
  const isFatal = isFatalGeneralError(error);

  useEffect(() => {
    if (prevIsOpenRef.current !== false && isOpen === false) {
      openClosedModal();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, openClosedModal]);

  // Old webapp parity: report to the bot and drop the session once.
  useEffect(() => {
    if (!isFatal || reportedRef.current) return;

    reportedRef.current = true;
    clearUser(shopid);
    postBotError(getErrorText(error, shopid)).catch(() => undefined);
  }, [isFatal, error, shopid]);

  if (isFatal) return <FatalError />;

  return (
    <>
      {isClick() && <ClickProvider clickToken={clickToken} />}
      {children}
    </>
  );
};
