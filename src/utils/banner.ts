import type { BannerProps } from "@/types/banner";

export type BannerTarget =
  | { type: "category"; id: number }
  | { type: "product"; id: number }
  | { type: "url"; url: string };

export const getBannerTarget = (banner: BannerProps): BannerTarget | null => {
  if (typeof banner.category === "number") {
    return { type: "category", id: banner.category };
  }

  if (typeof banner.product === "number") {
    return { type: "product", id: banner.product };
  }

  const url = banner.url?.trim();

  if (banner.have_url && url) return { type: "url", url };

  return null;
};
