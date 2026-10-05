"use client";

import Link from "next/link";
import { IconArrowRight, IconLayoutGrid } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

type CategoryMoreCardProps = {
  href: string;
  count: number;
};

const CategoryMoreCard = ({ href, count }: CategoryMoreCardProps) => {
  const t = useTranslations();

  return (
    <Link
      href={href}
      className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-gray180 bg-white px-4 text-center transition-transform duration-300 ease-out hover:-translate-y-0.5"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary10 text-primary">
        <IconLayoutGrid size={28} />
      </span>
      <span className="text-sm font-normal text-gray220">
        {t("home_more_products", { count })}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
        {t("home_see_all")}
        <IconArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
};

export default CategoryMoreCard;
