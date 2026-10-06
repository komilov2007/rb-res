"use client";

import { useEffect, useRef } from "react";

import type { ChatFileProps, ChatSocketFilePayload, ChatSocketIncoming, ChatSocketTextPayload, MessageProps } from "@/types/chat";

const SOCKET_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_BASE_URL;

type UseChatSocketProps = {
  customerId?: number;
  shopId?: string;
  onMessage: (message: MessageProps) => void;
};

export const useChatSocket = ({
  customerId,
  shopId,
  onMessage,
}: UseChatSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!customerId || !SOCKET_BASE_URL) return;

    const socket = new WebSocket(`${SOCKET_BASE_URL}${customerId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      let parsed: ChatSocketIncoming;

      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }

      if (parsed.type !== "CHAT" || !parsed.data) return;

      onMessageRef.current({
        id: Date.now(),
        is_bot: parsed.data.is_bot,
        created_at: new Date().toISOString(),
        message_type: "MESSAGE",
        text: parsed.data.message,
        file: parsed.data.file ?? null,
      });
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [customerId]);

  const sendText = (message: string) => {
    const socket = socketRef.current;

    if (!customerId || !shopId || socket?.readyState !== WebSocket.OPEN) {
      return false;
    }

    const payload: ChatSocketTextPayload = {
      type: "CHAT",
      data: {
        shop: shopId,
        is_bot: false,
        platform: "TELEGRAM",
        message,
        customer: customerId,
      },
    };

    socket.send(JSON.stringify(payload));

    return true;
  };

  const sendFile = (file: ChatFileProps, message: string) => {
    const socket = socketRef.current;

    if (!customerId || !shopId || socket?.readyState !== WebSocket.OPEN) {
      return false;
    }

    const payload: ChatSocketFilePayload = {
      type: "CHAT",
      data: {
        chat_created: true,
        customer: customerId,
        message,
        platform: "TELEGRAM",
        shop: shopId,
        is_bot: false,
        file,
      },
    };

    socket.send(JSON.stringify(payload));

    return true;
  };

  return { sendText, sendFile };
};
