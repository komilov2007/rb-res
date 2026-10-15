"use client";

import { useTranslations } from "next-intl";

import type { AtmosphereTab } from "@/utils/atmosphere";

type AtmosphereTabsProps = {
  tabs: AtmosphereTab[];
  activeTab: string | null;
  onChange: (key: string | null) => void;
  className?: string;
};

const AtmosphereTabs = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}: AtmosphereTabsProps) => {
  const t = useTranslations();

  if (tabs.length === 0) return null;

  const items = [{ key: null, title: t("atmosphere_tabs_all") }, ...tabs];

  return (
    <div className={`scroll-hidden flex gap-2 overflow-x-auto ${className}`}>
      {items.map((tab) => (
        <button
          key={tab.key ?? "all"}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? "bg-primary text-white"
              : "bg-gray10 text-gray220"
          }`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
};

export default AtmosphereTabs;
