import type { ServiceTypeValue } from "./order";

export type GeneralProps = {
  id: string;
  logo: string | null;
  name: string;
  languages?: string[];
  business_phone?: string | null;
  socials?: {
    id: number;
    type: string;
    url: string;
  }[];
  is_open?: boolean;
  // Present when is_open is false (confirmed live) — the shop's own
  // closed-message, e.g. "Do'kon ish vaqti tugagan!".
  message?: string | null;
  is_free?: boolean;
  services?: {
    id: number;
    type: ServiceTypeValue;
    is_active: boolean;
    shipping_time: boolean;
    min_price: number | null;
  }[];
  delivery?: {
    // Delivery price type ("FIXED" confirmed live) — not a delivery provider.
    delivery_type: string;
    min_price: number | null;
    price: number | null;
    text: string | null;
  };
  // Confirmed live against webapp/general/{shop}: cashback_amount is null
  // while cashback is disabled.
  cashback_enabled?: boolean;
  cashback_amount?: number | null;
  currency?: {
    id: number;
    name: string;
    code: string;
  };
  working_time?: Record<
    string,
    {
      hours: {
        open: string;
        close: string;
      }[];
      is_closed: boolean;
    }
  >;
};
