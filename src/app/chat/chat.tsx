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

  // AuthProvider populates the auth store from localStorage in its own
  // effect; since it's an ancestor, that effect fires *after* this
  // component's on a fresh page load (React runs child effects before
  // parent effects on mount) — checking hasAccess immediately would bounce
  // an already-logged-in user before it's even been read. Same
  // isHydrated-gated pattern the order page's own access guard uses to wait
  // out that first commit before trusting the store.
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const mustLogin = isHydrated && !hasAccess;

  // Direct navigation to /chat while logged out (the floating-action button
  // itself already guards its own click): send the user home and open the
  // login modal there.
  useEffect(() => {
    if (!mustLogin) return;

    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    setLoginModal(true);
  }, [mustLogin, router, shopid, setLoginModal]);

  if (!isHydrated || !hasAccess) return null;

  // Mobile: the panel is the whole screen. Desktop (lg+): site header/footer
  // shell with the panel as one full-bleed, viewport-high white block (the
  // header + breadcrumb stack is ~169px, plus the 8px gutters).
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

// useSearchParams (shop_id) needs a Suspense boundary.
const Chat = () => (
  <Suspense>
    <ChatContent />
  </Suspense>
);

export default Chat;
