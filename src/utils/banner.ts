import type { BannerProps } from "@/types/banner";
import type { GeneralProps } from "@/types/general";
import { formatPrice } from "@/utils/format-price";
import type { useTranslations } from "next-intl";

type Translate = ReturnType<typeof useTranslations>;

export type BannerTarget =
  | { type: "category"; id: number }
  | { type: "product"; id: number }
  | { type: "url"; url: string };

// Where a banner tap leads, checked in order: category → product → url.
// null means a static, non-clickable banner.
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

export const getTodayWorkTime = (
  workingTime: GeneralProps["working_time"] | undefined,
  t: Translate,
) => {
  if (!workingTime) return t("work_time");

  const day = new Date().getDay() || 7;
  const today = workingTime[String(day)];
  const firstHour = today?.hours[0];

  if (!today || today.is_closed || !firstHour) return t("common_closed");

  return `${formatTime(firstHour.open)}-${formatTime(firstHour.close)}`;
};

export const getServicesTitle = (
  shop: GeneralProps | undefined,
  t: Translate,
) => {
  const services = getActiveServiceNames(shop, t);

  if (services.length > 1) return services.join(` ${t("shared_and")} `);
  if (services.length === 1) return services[0];

  return t("service");
};

export const getServicesText = (
  shop: GeneralProps | undefined,
  t: Translate,
) => {
  const services = getActiveServiceNames(shop, t);

  if (services.length > 1) return "";
  if (services[0] === t("delivery")) return getDeliveryPriceText(shop, t);
  if (services[0] === t("pickup")) return t("pickup_yourself");

  return t("available_services");
};

const formatTime = (time: string) => {
  return time.slice(0, 5);
};

const getActiveServiceNames = (
  shop: GeneralProps | undefined,
  t: Translate,
) => {
  return (
    shop?.services
      ?.filter((service) => service.is_active)
      .map((service) => {
        if (service.type === "DELIVERY") return t("delivery");
        if (service.type === "PICKUP") return t("pickup");

        return service.type;
      }) ?? []
  );
};

const getDeliveryPriceText = (shop: GeneralProps | undefined, t: Translate) => {
  if (shop?.is_free) return t("free_delivery");
  if (shop?.delivery?.price)
    return `${formatPrice(shop.delivery.price)} ${t("sum")}`;

  return t("delivery_available");
};
