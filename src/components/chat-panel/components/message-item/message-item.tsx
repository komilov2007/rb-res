"use client";

import { useState } from "react";
import { CheckCheck, Download, ShoppingBag } from "lucide-react";
import { IconFileTextFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import ImageViewer from "@/components/image-viewer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getOrderDetailUrl } from "@/utils/orders";
import { useShopId } from "@/hooks/useShopId";
import { useUiStore } from "@/stores/ui";
import type { ChatFileProps, MessageProps } from "@/types/chat";
import { formatChatTime } from "@/utils/format-date";
import { formatFileSize } from "@/utils/format-file";
import { handleImageFallback } from "@/utils/image";

type MessageItemProps = {
  message: MessageProps;
};

// Tapping an image opens it fullscreen.
const MessageImage = ({ file }: { file: ChatFileProps }) => {
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <>
      <img
        src={file.url}
        alt={file.name}
        onError={handleImageFallback}
        onClick={() => setViewerOpen(true)}
        className="max-h-64 w-full max-w-[220px] cursor-zoom-in rounded-xl object-cover"
      />
      <ImageViewer
        images={[file.url]}
        openIndex={viewerOpen ? 0 : null}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
};

// Inline preview for image and video attachments; any other file type
// renders as a generic file link.
const MessageFile = ({ file }: { file: ChatFileProps }) => {
  if (file.type === "video") {
    return (
      <video
        src={file.url}
        controls
        playsInline
        preload="metadata"
        className="max-h-64 w-full max-w-[220px] rounded-xl bg-black object-cover"
      />
    );
  }

  if (file.type === "image") {
    return <MessageImage file={file} />;
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray220">
        <IconFileTextFilled size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">
          {file.name}
        </span>
        <span className="block text-[11px] text-gray220">
          {formatFileSize(file.size)}
        </span>
      </span>
      <Download size={15} className="shrink-0 text-gray220" />
    </a>
  );
};

const MessageItem = ({ message }: MessageItemProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setChatModalOpen = useUiStore((state) => state.setChatModalOpen);
  const isOwn = !message.is_bot;
  const time = formatChatTime(message.created_at);

  if (message.message_type === "ORDER") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl bg-white px-3 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-black">
              <ShoppingBag size={15} className="text-gray220" />
              {t("chat_message_order_title", { id: message.order_id ?? "" })}
            </span>
            {time && (
              <span className="shrink-0 text-[11px] text-gray220">
                {time}
              </span>
            )}
          </div>

          {message.text && (
            <p className="mt-1.5 text-sm text-gray220">{message.text}</p>
          )}

          {typeof message.products_count === "number" && (
            <p className="info-label mt-1">
              {t("chat_message_products_count")}{" "}
              <span className="text-[13px] font-medium text-gray220/70">
                {t("chat_message_products_count_value", {
                  count: message.products_count,
                })}
              </span>
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              // Desktop shows the chat as a modal, so navigating alone leaves
              // it open on top of the order page; mobile's /chat is a route
              // that unmounts on its own (the flag is already false there).
              setChatModalOpen(false);
              router.push(
                getOrderDetailUrl(isDesktop, shopid, message.order_id),
              );
            }}
            className="mt-2 flex h-9 w-full cursor-pointer items-center justify-center rounded-xl bg-gray10 text-sm font-medium text-black transition-colors hover:bg-gray180"
          >
            {t("chat_message_go_to_order")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] flex-col gap-2 rounded-2xl px-3 py-2 ${
          isOwn
            ? "bg-primary text-white"
            : "bg-white text-black shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
        }`}
      >
        {message.file && <MessageFile file={message.file} />}
        {message.text && (
          <p className="whitespace-pre-line text-sm">{message.text}</p>
        )}

        <span
          className={`flex items-center justify-end gap-1 text-[11px] ${
            isOwn ? "text-white/75" : "text-gray220"
          }`}
        >
          {time}
          {isOwn && <CheckCheck size={13} />}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
