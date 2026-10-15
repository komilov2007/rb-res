export type BannerType = "MAIN" | "CATEGORY";

export type BannerProps = {
  id: number;
  banner_type: BannerType;
  mobile_photo: string;
  desktop_photo: string | null;
  have_url: boolean;
  have_internal_url: boolean;
  url: string | null;
  created_at: string;
  updated_at: string;
  shop: string;
  category: number | null;
  category_name: string | null;
  product: number | null;
  product_name: string | null;
  button_name: string | null;
};

export type BannerParams = {
  type?: BannerType;
  category?: number;
};
