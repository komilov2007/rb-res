"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { ROUTER } from "@/constants/router";
import { useShopid } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";

import ChatHeader from "./components/chat-header";
import ChatInput from "./components/chat-input";
import MessageList from "./components/message-list";
import { useChat } from "./useChat";

const subscribeNoop = () => () => {};

const ChatContent = () => {
  const router = useRouter();
  const { shopid } = useShopid();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    messageText,
    setMessageText,
    selectedFile,
    previewUrl,
    setSelectedFile,
    clearSelectedFile,
    canSend,
    isSendingFile,
    handleSend,
  } = useChat();

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
    setLoginModal(true)();
  }, [mustLogin, router, shopid, setLoginModal]);

  if (!isHydrated || !hasAccess) return null;

  return (
    <div className="flex h-dvh flex-col bg-gray10">
      <ChatHeader />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
      <ChatInput
        value={messageText}
        onChange={setMessageText}
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        onSelectFile={setSelectedFile}
        onClearFile={clearSelectedFile}
        canSend={canSend}
        isSending={isSendingFile}
        onSend={handleSend}
      />
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
