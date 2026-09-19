import { useTranslations } from "next-intl";

import type { OrderStatusValue } from "@/types/order";

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  NEW: "orders.status.NEW",
  PROGRESS: "orders.status.PROGRESS",
  READY: "orders.status.READY",
  ON_THE_WAY: "orders.status.ON_THE_WAY",
  DELIVERED: "orders.status.DELIVERED",
  COMPLETED: "orders.status.COMPLETED",
  CANCEL: "orders.status.CANCEL",
  CANCELED_BY_CUSTOMER: "orders.status.CANCELED_BY_CUSTOMER",
};

type BadgeVariant = "success" | "warning" | "danger";

const STATUS_VARIANT: Record<OrderStatusValue, BadgeVariant> = {
  NEW: "success",
  PROGRESS: "warning",
  READY: "warning",
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
  danger: "bg-red/10 text-red",
};

type StatusBadgeProps = {
  status: OrderStatusValue;
  size?: "sm" | "md";
  showDot?: boolean;
};

const SIZE_CLASS_NAMES = {
  sm: "px-2.5 py-1 text-[11px] font-bold",
  md: "gap-1.5 px-3 py-1.5 text-[13px] font-medium",
};

const StatusBadge = ({ status, size = "sm", showDot = false }: StatusBadgeProps) => {
  const t = useTranslations();

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full leading-none ${SIZE_CLASS_NAMES[size]} ${VARIANT_CLASS_NAMES[STATUS_VARIANT[status]]}`}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status}
    </span>
  );
};

export default StatusBadge;
