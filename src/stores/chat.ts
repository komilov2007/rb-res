import { create } from "zustand";
import type { MessageProps } from "@/types/chat";

type ChatStoreProps = {
  page: number;
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

const initialState: Pick<ChatStoreProps, "page" | "count" | "messages" | "hasMore"> = {
  page: 1,
  count: 0,
  messages: [],
  hasMore: true,
};

export const useChatStore = create<ChatStoreProps>()((set) => ({
  ...initialState,

  setInitialMessages: (messages, count) => {
    set({ messages, count, page: 1, hasMore: messages.length < count });
  },

  appendOlderMessages: (older, count) => {
    set((state) => {
      const messages = [...state.messages, ...older];

      return {
        messages,
        count,
        page: state.page + 1,
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
