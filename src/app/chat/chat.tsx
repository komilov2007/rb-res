"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";

import Breadcrumb from "@/components/breadcrumb";
import ChatPanel from "@/components/chat-panel";
import Footer from "@/components/footer";
import Header from "@/components/header";

const subscribeNoop = () => () => {};

const ChatContent = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const mustLogin = isHydrated && !hasAccess;

  useEffect(() => {
    if (!mustLogin) return;

    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    setLoginModal(true);
  }, [mustLogin, router, shopid, setLoginModal]);

  if (!isHydrated || !hasAccess) return null;

  return (
    <div className="lg:flex lg:min-h-screen lg:flex-col lg:bg-gray10">
      <div className="hidden lg:block">
        <Header />
      </div>
      <Breadcrumb items={[{ label: t("chat_header_title") }]} />

      <section className="lg:my-2 lg:flex-1 lg:overflow-hidden lg:rounded-[30px] lg:bg-white">
        <ChatPanel
          onBack={() => router.back()}
          className="h-dvh lg:mx-auto lg:h-[calc(100dvh-156px)] lg:min-h-120 lg:w-full lg:max-w-7xl lg:bg-white lg:px-5"
        />
      </section>

      <Footer />
    </div>
  );
};

const Chat = () => (
  <Suspense>
    <ChatContent />
  </Suspense>
);

export default Chat;
