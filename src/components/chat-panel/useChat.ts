"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { getChatList, sendChatFile } from "@/apis/chat";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";

import { useChatSocket } from "./useChatSocket";

const PAGE_SIZE = 20;

type SelectedFileState = { file: File; previewUrl: string | null } | null;

export const useChat = () => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const customerId = useAuthStore((state) => state.auth?.customer);

  const messages = useChatStore((state) => state.messages);
  const hasMore = useChatStore((state) => state.hasMore);
  const setInitialMessages = useChatStore((state) => state.setInitialMessages);
  const appendOlderMessages = useChatStore(
    (state) => state.appendOlderMessages,
  );
  const addMessage = useChatStore((state) => state.addMessage);
  const reset = useChatStore((state) => state.reset);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedFileState, setSelectedFileState] =
    useState<SelectedFileState>(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  // Tracks the currently-live object URL so it can be revoked the moment
  // it's replaced or cleared — created/revoked at selection time (an event,
  // not an effect), so nothing here ever calls setState from inside an
  // effect body.
  const previewUrlRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);

  const { sendText, sendFile } = useChatSocket({
    customerId,
    shopId: shopid,
    onMessage: addMessage,
  });

  // Fresh history every time chat is opened. isLoading starts `true` (its
  // useState default) precisely for this first run; customerId isn't
  // expected to change again while this page stays mounted (a login/logout
  // both unmount it via the access guard), so there's no case that needs
  // resetting the flag back to true mid-session.
  useEffect(() => {
    if (!customerId) return;

    let cancelled = false;

    getChatList(customerId, { limit: PAGE_SIZE, offset: 0 })
      .then((response) => {
        if (cancelled) return;

        setInitialMessages(response.data.results, response.data.count);
      })
      .catch(() => {
        // The global request interceptor already toasts the backend's
        // message; caught so it isn't an unhandled rejection.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      reset();
    };
    // setInitialMessages/reset are stable zustand actions; only customerId
    // should re-trigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // Revoke a still-pending attachment's object URL if the chat page closes
  // before it's sent. Pure cleanup — no state is set here.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setSelectedFile = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setSelectedFileState(null);
      return;
    }

    const previewUrl = file.type.startsWith("image")
      ? URL.createObjectURL(file)
      : null;

    previewUrlRef.current = previewUrl;
    setSelectedFileState({ file, previewUrl });
  };

  const loadMore = async () => {
    // The ref, not just the state: several scroll events can fire before
    // the isLoadingMore re-render lands, and each would fetch the same page.
    if (!customerId || !hasMore || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const response = await getChatList(customerId, {
        limit: PAGE_SIZE,
        // Everything already on screen, not page × size: messages that
        // arrived over the socket shift the server list, so a page-based
        // offset would re-fetch rows already shown (duplicate keys).
        offset: messages.length,
      });

      appendOlderMessages(response.data.results, response.data.count);
    } catch {
      // The global request interceptor already toasts the backend's message.
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  const canSend =
    (messageText.trim().length > 0 || Boolean(selectedFileState)) &&
    !isSendingFile;

  const clearSelectedFile = () => setSelectedFile(null);

  const handleSend = async () => {
    if (!customerId || !shopid) return;

    const trimmed = messageText.trim();

    if (selectedFileState) {
      setIsSendingFile(true);

      try {
        const response = await sendChatFile({
          file: selectedFileState.file,
          message: trimmed || undefined,
          platform: "TELEGRAM",
          customer: String(customerId),
          is_bot: "false",
          shop: shopid,
        });

        if (!sendFile(response.data.file, trimmed)) {
          toast.error(t("chat_connection_error"));
          return;
        }

        setMessageText("");
        setSelectedFile(null);
      } catch {
        // The global request interceptor already toasts the backend's message.
      } finally {
        setIsSendingFile(false);
      }

      return;
    }

    if (!trimmed) return;

    if (!sendText(trimmed)) {
      toast.error(t("chat_connection_error"));
      return;
    }

    setMessageText("");
  };

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    messageText,
    setMessageText,
    selectedFile: selectedFileState?.file ?? null,
    previewUrl: selectedFileState?.previewUrl ?? null,
    setSelectedFile,
    clearSelectedFile,
    canSend,
    isSendingFile,
    handleSend,
  };
};
