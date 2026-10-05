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
    delivery_type: string;
    min_price: number | null;
    price: number | null;
    text: string | null;
  };
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
