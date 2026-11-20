"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, WheelEvent } from "react";
import { useTranslations } from "next-intl";

import type { AtmosphereTab } from "@/utils/atmosphere";

type AtmosphereTabsProps = {
  tabs: AtmosphereTab[];
  activeTab: string | null;
  onChange: (key: string | null) => void;
  className?: string;
};

const DRAG_THRESHOLD = 5;

const AtmosphereTabs = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}: AtmosphereTabsProps) => {
  const t = useTranslations();
  const listRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });

  // Keep the selected chip visible after a change.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>('[data-active="true"]');
    if (!list || !chip) return;

    const left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeTab]);

  // Mouse drag-to-scroll (touch already scrolls natively).
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !listRef.current) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: listRef.current.scrollLeft,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state.active || !listRef.current) return;

    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) state.moved = true;
    if (state.moved) listRef.current.scrollLeft = state.scrollLeft - delta;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  // Vertical wheel scrolls the chips horizontally when they overflow.
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    list.scrollLeft += event.deltaY;
  };

  if (tabs.length === 0) return null;

  const items = [{ key: null, title: t("atmosphere_tabs_all") }, ...tabs];

  return (
    <div
      ref={listRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={handleWheel}
      className={`scroll-hidden flex min-w-0 select-none gap-2 overflow-x-auto overscroll-x-contain ${className}`}
    >
      {items.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key ?? "all"}
            type="button"
            data-active={isActive}
            onClick={(event) => {
              if (drag.current.moved) {
                event.preventDefault();
                drag.current.moved = false;
                return;
              }
              onChange(tab.key);
            }}
            className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "bg-primary text-white" : "bg-gray10 text-gray220"
            }`}
          >
            {tab.title}
          </button>
        );
      })}
    </div>
  );
};

export default AtmosphereTabs;
