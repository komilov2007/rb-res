"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";

import ChatPanel from "@/components/chat-panel";

const subscribeNoop = () => () => {};

const ChatContent = () => {
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

  return (
    <ChatPanel onBack={() => router.back()} className="h-dvh" />
  );
};

// useSearchParams (shop_id) needs a Suspense boundary.
const Chat = () => (
  <Suspense>
    <ChatContent />
  </Suspense>
);

export default Chat;
