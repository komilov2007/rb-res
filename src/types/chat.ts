export type ChatFileProps = {
  name: string;
  type: "video" | "image" | null;
  url: string;
  size: number;
};

export type ChatMessageTypeProps = "ORDER" | "MESSAGE";

export type MessageProps = {
  id: number | string;
  is_bot: boolean;
  created_at: string;
  message_type: ChatMessageTypeProps;
  text: string;
  // Documented as required, but confirmed to arrive null/absent — always
  // guard with `message.file &&` before rendering.
  file?: ChatFileProps | null;
  order_id?: number;
  products_count?: number;
};

export type ChatListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MessageProps[];
};

// Incoming WebSocket frame — both a bot reply and the echo of a message the
// current customer just sent arrive through this same shape.
export type ChatSocketIncoming = {
  type: "CHAT";
  status_code: number;
  data: {
    shop: string;
    is_bot: boolean;
    message: string;
    customer: number;
    platform: string;
    file?: ChatFileProps | null;
  };
};

export type ChatSocketTextPayload = {
  type: "CHAT";
  data: {
    shop: string;
    is_bot: false;
    platform: "TELEGRAM";
    message: string;
    customer: number;
  };
};

// `chat_created` isn't part of the incoming/outgoing text shape above, but
// the socket expects it on a file announcement.
export type ChatSocketFilePayload = {
  type: "CHAT";
  data: {
    chat_created: true;
    customer: number;
    message: string;
    platform: "TELEGRAM";
    shop: string;
    is_bot: false;
    file: ChatFileProps;
  };
};
