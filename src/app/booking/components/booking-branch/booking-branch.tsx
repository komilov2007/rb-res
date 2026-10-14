"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useBookingBranch } from "./useBookingBranch";

type BookingBranchProps = {
  triggerClassName: (hasError: boolean) => string;
  showIcon?: boolean;
  showError?: boolean;
};

const BookingBranch = ({
  triggerClassName,
  showIcon = true,
  showError = true,
}: BookingBranchProps) => {
  const t = useTranslations();
  const { branches, value, isLoading, selectBranch, error } =
    useBookingBranch();

  return (
    <div className="min-w-0">
      <Select value={value} onValueChange={selectBranch} disabled={isLoading}>
        <SelectTrigger
          aria-label={t("common_branch")}
          className={triggerClassName(Boolean(error))}
        >
          {showIcon && <MapPin size={18} className="shrink-0 text-gray220" />}
          <SelectValue placeholder={t("select_branch")} />
        </SelectTrigger>
        <SelectContent className="max-h-64 w-[var(--radix-select-trigger-width)] rounded-xl">
          {branches.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray220">
              {t("order_page_branches_not_found")}
            </p>
          ) : (
            branches.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {showError && error && (
        <span className="mt-1 block px-1 text-xs text-red">{error}</span>
      )}
    </div>
  );
};

export default BookingBranch;
