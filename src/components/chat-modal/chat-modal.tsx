"use client";

import { useTranslations } from "next-intl";

import ChatPanel from "@/components/chat-panel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

// Desktop support chat as a modal (opened via useOpenChat). Mounted once
// in the app provider; the ChatPanel — and with it the history fetch and
// the socket — only mounts while the modal is open. Mobile uses /chat.
const ChatModal = () => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const isOpen = useUiStore((state) => state.isChatModalOpen);
  const setChatModalOpen = useUiStore((state) => state.setChatModalOpen);

  const close = () => setChatModalOpen(false);

  return (
    <Dialog
      open={isDesktop && hasAccess && isOpen}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="h-[min(680px,90dvh)] w-[440px] max-w-[440px] gap-0 overflow-hidden rounded-2xl border border-gray180 p-0 sm:max-w-[440px]"
      >
        <DialogTitle className="sr-only">{t("chat_header_title")}</DialogTitle>
        <ChatPanel onBack={close} backIcon="close" className="h-full min-h-0" />
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
