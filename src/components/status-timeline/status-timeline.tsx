import { Check, PackageCheck, ShoppingBag } from "lucide-react";
import { IconChefHatFilled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";

import type { OrderStatusValue } from "@/types/order";

const CANCELLED_STATUSES: OrderStatusValue[] = [
  "CANCEL",
  "CANCELED_BY_CUSTOMER",
];

// INFERRED — the real step-by-step kitchen/pickup progression was never
// confirmed against the backend, only the final OrderStatusValue enum
// itself (see AGENTS.md Section 37/39: don't guess API contracts). This is
// a best-effort visual mapping layered on top of that enum, not a
// confirmed backend contract. READY and ON_THE_WAY both map to step 3
// (the design's 4-step stepper has no separate "out for delivery" step).
const STEP_FOR_STATUS: Partial<Record<OrderStatusValue, number>> = {
  NEW: 1,
  PROGRESS: 2,
  READY: 3,
  ON_THE_WAY: 3,
  DELIVERED: 4,
  COMPLETED: 4,
};

const STEP_LABELS = [
  "orders_timeline_accepted",
  "orders_timeline_preparing",
  "orders_timeline_ready",
  "orders_timeline_handed_over",
];

const STEP_ICONS = [Check, IconChefHatFilled, ShoppingBag, PackageCheck];

type StatusTimelineProps = {
  status: OrderStatusValue;
};

// Always-visible 4-step horizontal stepper (per the order-placing design
// spec) — replaces the earlier collapsible badge+list version. Only two
// visual states exist here (done vs upcoming): a step is "done" once its
// number is <= the current step, matching the filled/blue-check vs
// gray-outline distinction the design calls for.
const StatusTimeline = ({ status }: StatusTimelineProps) => {
  const t = useTranslations();
  const isCancelled = CANCELLED_STATUSES.includes(status);

  if (isCancelled) {
    // Deliberately low-key: one plain line, red dot + label, no box/badge —
    // reads as cancelled at a glance without dominating the detail page.
    return (
      <p className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 shrink-0 rounded-full bg-red" />
        <span className="font-medium text-red">{t("orders_timeline_cancelled")}</span>
        {/* Plain CANCEL doesn't say who cancelled — no guessed reason. */}
        {status === "CANCELED_BY_CUSTOMER" && (
          <span className="min-w-0 truncate text-gray220">
            · {t("orders_timeline_by_customer")}
          </span>
        )}
      </p>
    );
  }

  const currentStep = STEP_FOR_STATUS[status] ?? 1;

  return (
    <div className="flex items-start">
      {STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber <= currentStep;
        const isLast = index === STEP_LABELS.length - 1;
        const StepIcon = STEP_ICONS[index];

        return (
          <div key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-16 flex-col items-center gap-2 text-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? "bg-primary text-white"
                    : "border border-gray180 text-gray180"
                }`}
              >
                <StepIcon size={14} strokeWidth={done ? 2.5 : 2} />
              </span>
              <span
                className={`text-[11px] leading-tight font-medium ${
                  done ? "text-primary" : "text-gray220"
                }`}
              >
                {t(label)}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mt-3.25 h-px flex-1 ${
                  stepNumber < currentStep ? "bg-primary" : "bg-gray180"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
