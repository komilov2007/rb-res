"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { IconClipboardListFilled } from "@tabler/icons-react";

import { useActiveOrdersCount } from "@/hooks/useActiveOrdersCount";
import { useShopId } from "@/hooks/useShopId";
import { getProfileOrdersUrl } from "@/utils/orders";

import {
  ORDERS_PREVIEW_GROUPS,
  useOrdersPreview,
  useOrdersPreviewStore,
} from "./store";

// TEMPORARY — desktop-only building blocks for the "Buyurtmalarim"
// placement preview. Every piece is `hidden lg:*`, so mobile is untouched.

export const useGoToOrders = () => {
  const router = useRouter();
  const { shopid } = useShopId();

  return () => router.push(getProfileOrdersUrl(shopid));
};

// Left-edge collapsible sidebar to flip between variants.
export const OrdersPreviewSwitcher = () => {
  const variant = useOrdersPreviewStore((state) => state.variant);
  const setVariant = useOrdersPreviewStore((state) => state.setVariant);
  const panelOpen = useOrdersPreviewStore((state) => state.panelOpen);
  const togglePanel = useOrdersPreviewStore((state) => state.togglePanel);

  return (
    <div
      className={`fixed left-0 top-1/2 z-[100] hidden -translate-y-1/2 items-center transition-transform duration-300 lg:flex [body[data-scroll-locked]_&]:hidden! ${
        panelOpen ? "translate-x-0" : "-translate-x-60"
      }`}
    >
      <div className="flex max-h-[85vh] w-60 flex-col overflow-y-auto rounded-r-2xl border border-l-0 border-gray180 bg-white p-2 shadow-[0_8px_30px_rgba(17,24,39,0.15)]">
        <span className="px-2 pb-1 pt-1 text-xs text-gray220">
          Buyurtmalar joyi (preview)
        </span>
        {ORDERS_PREVIEW_GROUPS.map((group) => (
          <div key={group.title} className="mt-2 flex flex-col gap-0.5">
            <span className="px-2 pb-0.5 text-[11px] uppercase tracking-wide text-gray220">
              {group.title}
            </span>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setVariant(item.id)}
                className={`rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  variant === item.id
                    ? "bg-primary10 text-primary"
                    : "text-black hover:bg-gray10"
                }`}
              >
                {item.id}. {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={togglePanel}
        className="-ml-px flex h-24 w-7 items-center justify-center rounded-r-xl border border-l-0 border-gray180 bg-white text-gray220 shadow-[4px_0_12px_rgba(17,24,39,0.08)] hover:text-primary"
        aria-label="Preview panel"
      >
        <ChevronRight
          size={16}
          className={`transition-transform ${panelOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
};

// Variant 7 — link in the thin topbar.
export const OrdersTopbarLink = () => {
  const { showTopbarLink } = useOrdersPreview();
  const count = useActiveOrdersCount();
  const goToOrders = useGoToOrders();

  if (!showTopbarLink) return null;

  return (
    <button
      type="button"
      onClick={goToOrders}
      className="flex items-center gap-1.5 text-sm text-black transition-colors hover:text-primary"
    >
      <IconClipboardListFilled size={16} className="text-primary" />
      Buyurtmalarim
      {count > 0 && (
        <span className="rounded-full bg-primary px-1.5 text-[11px] leading-[18px] text-white">
          {count}
        </span>
      )}
    </button>
  );
};
