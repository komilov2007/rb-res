"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { MessageProps } from "@/types/chat";
import { getChatDateLabel } from "@/utils/format-date";

import MessageItem from "../message-item";

type MessageListProps = {
  messages: MessageProps[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

const NEAR_TOP_PX = 60;
const NEAR_BOTTOM_PX = 80;

// A small centered loader over the (still-visible, softened) skeleton
// bubbles — reads as "loading" immediately on open, with the skeleton
// giving a sense of the chat layout underneath instead of a bare spinner.
const MessageListSkeleton = () => (
  <div className="relative flex flex-1 flex-col justify-end gap-3 overflow-hidden px-4 py-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className={`skeleton h-12 w-2/3 rounded-2xl ${
          index % 2 === 0 ? "self-start" : "self-end"
        }`}
      />
    ))}
    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
      <Loader2 size={22} className="animate-spin text-primary" />
    </div>
  </div>
);

// `messages` from the store is newest-first; scroll/pagination bookkeeping
// below is built around that order (older pages land at the end).
const MessageList = ({
  messages,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: MessageListProps) => {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const isRestoringScrollRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const previousCountRef = useRef(0);
  const hasScrolledInitiallyRef = useRef(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const chronological = [...messages].reverse();

  const handleScroll = () => {
    const el = containerRef.current;

    if (!el) return;

    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    setShowScrollDown(!isNearBottomRef.current);

    if (el.scrollTop < NEAR_TOP_PX && hasMore && !isLoadingMore) {
      previousScrollHeightRef.current = el.scrollHeight;
      isRestoringScrollRef.current = true;
      onLoadMore();
    }
  };

  // Single effect covers all three scroll-position cases: jump to the
  // newest message on first load, keep history in place when older
  // messages are appended above the fold, and auto-scroll to new arrivals
  // only while the user is already at (or near) the bottom.
  useLayoutEffect(() => {
    const el = containerRef.current;

    if (!el || isLoading) return;

    if (isRestoringScrollRef.current) {
      el.scrollTop = el.scrollHeight - previousScrollHeightRef.current;
      isRestoringScrollRef.current = false;
      return;
    }

    if (!hasScrolledInitiallyRef.current) {
      el.scrollTop = el.scrollHeight;
      hasScrolledInitiallyRef.current = true;
      previousCountRef.current = messages.length;
      return;
    }

    const grew = messages.length > previousCountRef.current;

    previousCountRef.current = messages.length;

    // A message the user just sent always scrolls into view, even when they
    // were reading history further up; incoming ones only while at the bottom.
    const isOwnNewest = messages[0] ? !messages[0].is_bot : false;

    if (grew && (isNearBottomRef.current || isOwnNewest)) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  if (isLoading) return <MessageListSkeleton />;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {isLoadingMore && (
          <div className="flex justify-center pb-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray180 border-t-primary" />
          </div>
        )}

        {chronological.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray220">
            {t("chat_list_empty")}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chronological.map((message, index) => {
              const previous = chronological[index - 1];
              const showDateLabel =
                !previous ||
                getChatDateLabel(previous.created_at) !==
                  getChatDateLabel(message.created_at);

              return (
                <div key={message.id} className="flex flex-col gap-3">
                  {showDateLabel && (
                    <div className="flex justify-center">
                      <span className="rounded-full bg-gray180/70 px-3 py-1 text-xs font-medium text-gray220">
                        {getChatDateLabel(message.created_at)}
                      </span>
                    </div>
                  )}
                  <MessageItem message={message} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showScrollDown && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label={t("chat_list_scroll_down")}
          className="absolute bottom-3 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_16px_rgba(15,23,42,0.16)]"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
