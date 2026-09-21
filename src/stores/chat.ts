import { create } from "zustand";
import type { MessageProps } from "@/types/chat";

type ChatStoreProps = {
  count: number;
  messages: MessageProps[];
  hasMore: boolean;
  // Page 1 (fresh open / reload) replaces the list outright.
  setInitialMessages: (messages: MessageProps[], count: number) => void;
  // `messages` is newest-first (index 0 = most recent), so an older page
  // (loaded when the user scrolls up to history) is appended at the end.
  appendOlderMessages: (messages: MessageProps[], count: number) => void;
  // A brand-new message (sent or incoming over the socket) goes to the front.
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
      // Never show the same message twice, whatever the offset returned.
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
