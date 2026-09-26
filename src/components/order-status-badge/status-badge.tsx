import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import type { OrderStatusValue } from "@/types/order";

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  NEW: "orders_status_new",
  PROGRESS: "orders_status_progress",
  READY: "orders_status_ready",
  ON_THE_WAY: "orders_status_on_the_way",
  DELIVERED: "orders_status_delivered",
  COMPLETED: "orders_status_completed",
  CANCEL: "orders_status_cancel",
  CANCELED_BY_CUSTOMER: "orders_status_canceled_by_customer",
};

type BadgeVariant = "success" | "warning" | "info" | "danger";

const STATUS_VARIANT: Record<OrderStatusValue, BadgeVariant> = {
  NEW: "success",
  PROGRESS: "warning",
  // Its own colour so "ready" doesn't read like "still preparing".
  READY: "info",
  ON_THE_WAY: "warning",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCEL: "danger",
  CANCELED_BY_CUSTOMER: "danger",
};

// Reuses this project's existing color tokens rather than inventing new
// ones: green-500 already means "success" (order.tsx's selection state,
// your-order.tsx's discount line), --red already means "danger" (every
// inline error message across the order feature), --yellow/--yellow10 are
// this project's own real custom tokens (used for the sale-ribbon accent).
const VARIANT_CLASS_NAMES: Record<BadgeVariant, string> = {
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow10 text-yellow",
  info: "bg-sky-500/10 text-sky-600",
  danger: "bg-red/10 text-red",
};

type StatusBadgeProps = {
  status: OrderStatusValue;
  size?: "sm" | "md";
  showDot?: boolean;
  // Optional trailing icon (e.g. a chevron when the badge is a toggle);
  // takes the badge colour via currentColor.
  endIcon?: ReactNode;
};

const SIZE_CLASS_NAMES = {
  sm: "gap-1 px-2.5 py-1 text-[11px] font-medium",
  md: "gap-1.5 px-3 py-1.5 text-[13px] font-medium",
};

const StatusBadge = ({
  status,
  size = "sm",
  showDot = false,
  endIcon,
}: StatusBadgeProps) => {
  const t = useTranslations();

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full leading-none ${SIZE_CLASS_NAMES[size]} ${VARIANT_CLASS_NAMES[STATUS_VARIANT[status]]}`}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status}
      {endIcon}
    </span>
  );
};

export default StatusBadge;
