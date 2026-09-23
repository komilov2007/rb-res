"use client";

import { type ChangeEvent, type KeyboardEvent, useRef } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
import { IconSendFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { formatFileSize } from "@/utils/format-file";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  selectedFile: File | null;
  // Created at selection time (useChat.setSelectedFile) — this component
  // only displays it, it doesn't manage the object URL's lifecycle.
  previewUrl: string | null;
  onSelectFile: (file: File | null) => void;
  onClearFile: () => void;
  canSend: boolean;
  isSending: boolean;
  onSend: () => void;
};

const ChatInput = ({
  value,
  onChange,
  selectedFile,
  previewUrl,
  onSelectFile,
  onClearFile,
  canSend,
  isSending,
  onSend,
}: ChatInputProps) => {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSelectFile(event.target.files?.[0] ?? null);
    // Allows picking the same file again later (e.g. after clearing it).
    event.target.value = "";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();

    if (canSend && !isSending) onSend();
  };

  return (
    <div className="shrink-0 border-t border-gray180 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-gray10 px-3 py-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={selectedFile.name}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray220">
              <Paperclip size={16} />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-black">
              {selectedFile.name}
            </span>
            <span className="block text-[11px] text-gray220">
              {formatFileSize(selectedFile.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={onClearFile}
            aria-label={t("chat_input_remove_file_aria")}
            className="shrink-0 text-gray220"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={t("chat_input_attach_file_aria")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat_input_placeholder")}
          rows={1}
          // text-base (16px): under 16px, iOS Safari auto-zooms the whole
          // page (including the fixed navbar) when this textarea gets focus.
          className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl bg-gray10 px-4 py-2.5 text-base text-black outline-none placeholder:text-gray220"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend || isSending}
          aria-label={t("chat_input_send_aria")}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white ${
            isSending ? "" : "disabled:opacity-40"
          }`}
        >
          {/* isSending is only true while a file uploads — plain text
              sends stay instant. */}
          {isSending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <IconSendFilled size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
