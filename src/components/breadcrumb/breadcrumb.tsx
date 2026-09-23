"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { IconHomeFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";

export type BreadcrumbItem = {
  label: string;
  // Route without the query — shop_id is appended here.
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

// Desktop-only breadcrumb joined to the site Header: it slides 30px under the
// header (which sits above it, z-50) so its white fills the header's rounded
// corners, and it carries the rounded bottom itself. "Home" always comes
// first; the last item is the current page, not a link.
const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const shopQuery = shopid ? `?shop_id=${shopid}` : "";

  return (
    <div className="-mt-[30px] hidden w-full rounded-b-[30px] bg-white pt-[30px] lg:block">
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-2 px-5 py-4 text-xs font-normal text-gray220/60">
        <Link
          href={`${ROUTER.HOME}${shopQuery}`}
          className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-black!"
        >
          <IconHomeFilled size={14} />
          {t("catalog_home")}
        </Link>
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            <ChevronRight size={14} className="shrink-0" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={`${item.href}${shopQuery}`}
                className="shrink-0 transition-colors hover:text-black!"
              >
                {item.label}
              </Link>
            ) : (
              <span className="truncate text-black">{item.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumb;
