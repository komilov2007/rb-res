"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getChatList, sendChatFile } from "@/apis/chat";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useChatSocket } from "./useChatSocket";
import ChatHeader from "@/components/chat-panel/components/chat-header/index";
import ChatInput from "@/components/chat-panel/components/chat-input/index";
import MessageList from "@/components/chat-panel/components/message-list/index";

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
  const sendFileMutation = useMutation({ mutationFn: sendChatFile });
  const isSendingFile = sendFileMutation.isPending;
  const previewUrlRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);

  const { sendText, sendFile } = useChatSocket({
    customerId,
    shopId: shopid,
    onMessage: addMessage,
  });

  useEffect(() => {
    if (!customerId) return;

    let cancelled = false;

    getChatList(customerId, { limit: PAGE_SIZE, offset: 0 })
      .then((response) => {
        if (cancelled) return;

        setInitialMessages(response.data.results, response.data.count);
      })
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

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
    if (!customerId || !hasMore || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const response = await getChatList(customerId, {
        limit: PAGE_SIZE,
        offset: messages.length,
      });

      appendOlderMessages(response.data.results, response.data.count);
    } catch {
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
      try {
        const response = await sendFileMutation.mutateAsync({
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

type ChatPanelProps = {
  onBack: () => void;
  backIcon?: "back" | "close";
  className?: string;
};

const ChatPanel = ({ onBack, backIcon, className = "" }: ChatPanelProps) => {
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

  return (
    <div className={`flex flex-col bg-gray10 ${className}`}>
      <ChatHeader onBack={onBack} backIcon={backIcon} />
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

export { ChatPanel };

export default ChatPanel;
