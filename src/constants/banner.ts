import { Clock3, Truck } from "lucide-react";
import type { useTranslations } from "next-intl";

type Translate = ReturnType<typeof useTranslations>;

type GetBannerInfoItemsParams = {
  t: Translate;
  todayWorkTime: string;
  servicesTitle: string;
  servicesText: string;
};

export const getBannerInfoItems = ({
  t,
  todayWorkTime,
  servicesTitle,
  servicesText,
}: GetBannerInfoItemsParams) => [
  {
    icon: Clock3,
    label: todayWorkTime,
    value: t("work_time"),
  },
  {
    icon: Truck,
    label: servicesTitle,
    value: servicesText || t("service_type"),
  },
];
