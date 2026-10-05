import { create } from "zustand";
import type { MessageProps } from "@/types/chat";

type ChatStoreProps = {
  count: number;
  messages: MessageProps[];
  hasMore: boolean;
  setInitialMessages: (messages: MessageProps[], count: number) => void;
  appendOlderMessages: (messages: MessageProps[], count: number) => void;
  addMessage: (message: MessageProps) => void;
  reset: () => void;
};

const initialState: Pick<ChatStoreProps, "count" | "messages" | "hasMore"> = {
  count: 0,
  messages: [],
  hasMore: true,
};

export const useChatStore = create<ChatStoreProps>()((set) => ({
  ...initialState,

  setInitialMessages: (messages, count) => {
    set({ messages, count, hasMore: messages.length < count });
  },

  appendOlderMessages: (older, count) => {
    set((state) => {
      const seen = new Set(state.messages.map((message) => message.id));
      const messages = [
        ...state.messages,
        ...older.filter((message) => !seen.has(message.id)),
      ];

      return {
        messages,
        count,
        hasMore: messages.length < count,
      };
    });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [message, ...state.messages],
      count: state.count + 1,
    }));
  },

  reset: () => {
    set(initialState);
  },
}));
