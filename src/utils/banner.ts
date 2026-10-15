import type { BannerProps } from "@/types/banner";

export type BannerTarget =
  | { type: "category"; id: number }
  | { type: "product"; id: number }
  | { type: "url"; url: string };

export const getBannerTarget = (banner: BannerProps): BannerTarget | null => {
  if (!banner.have_url) return null;

  if (banner.have_internal_url) {
    if (typeof banner.category === "number") {
      return { type: "category", id: banner.category };
    }

    if (typeof banner.product === "number") {
      return { type: "product", id: banner.product };
    }

    return null;
  }

  const url = banner.url?.trim();

  return url ? { type: "url", url } : null;
};
