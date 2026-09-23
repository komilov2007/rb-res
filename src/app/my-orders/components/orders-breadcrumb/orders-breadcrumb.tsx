"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { IconHomeFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type OrdersBreadcrumbProps = {
  items: BreadcrumbItem[];
};

// Desktop-only breadcrumb bar under the site header — same full-bleed
// white bar + centered max-w-7xl row as the categories page's own one.
const OrdersBreadcrumb = ({ items }: OrdersBreadcrumbProps) => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";

  return (
    <div className="hidden w-full border-b border-gray180 bg-white lg:block">
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 px-5 py-4 text-xs text-gray220">
        <Link
          href={`${ROUTER.HOME}${shopQuery}`}
          className="flex items-center gap-1.5 font-medium hover:text-black"
        >
          <IconHomeFilled size={14} />
          {t("catalog_home")}
        </Link>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            <ChevronRight size={14} />
            {item.href && index < items.length - 1 ? (
              <Link
                href={`${item.href}${shopQuery}`}
                className="font-medium hover:text-black"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-black">{item.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </div>
  );
};

export default OrdersBreadcrumb;
