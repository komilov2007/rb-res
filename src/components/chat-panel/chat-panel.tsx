"use client";

import ChatHeader from "./components/chat-header";
import ChatInput from "./components/chat-input";
import MessageList from "./components/message-list";
import { useChat } from "./useChat";

type ChatPanelProps = {
  onBack: () => void;
  backIcon?: "back" | "close";
  className?: string;
};

// The whole chat UI (header, history, composer) and its data (useChat) —
// shared by the /chat page and the desktop ChatModal. Callers own the
// access guard and the outer size.
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

export default ChatPanel;
