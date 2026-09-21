"use client";

import { Edit3 } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";

// Exact class strings per placement — the desktop sidebar pads its rows,
// the mobile page doesn't.
const CLASSES = {
  mobile: {
    card: "rounded-2xl border border-gray180 bg-white p-2",
    skeleton: "flex items-center gap-4",
    row: "flex w-full items-center gap-4 text-left",
  },
  sidebar: {
    card: "rounded-2xl border border-gray180 bg-white p-3",
    skeleton: "flex items-center gap-4 p-2",
    row: "flex w-full items-center gap-4 p-2 text-left",
  },
} as const;

type AccountCardProps = {
  variant: keyof typeof CLASSES;
  isLoading: boolean;
  hasAccess: boolean;
  initials: string;
  name: string;
  phone: string;
  onEdit: () => void;
  onLogin: () => void;
};

// Avatar initials + name + phone. Logged in: an edit button; guest: the whole
// card opens login.
const AccountCard = ({
  variant,
  isLoading,
  hasAccess,
  initials,
  name,
  phone,
  onEdit,
  onLogin,
}: AccountCardProps) => {
  const t = useTranslations();
  const classes = CLASSES[variant];

  const identity = (
    <>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary10 text-sm font-bold text-primary">
        {initials || "U"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-black">{name}</p>
        <p className="mt-1 truncate text-xs font-normal text-gray220">
          {phone}
        </p>
      </div>
    </>
  );

  return (
    <div className={classes.card}>
      {isLoading && hasAccess ? (
        <div className={classes.skeleton}>
          <div className="h-14 w-14 rounded-full bg-gray10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 rounded-full bg-gray10" />
            <div className="h-3 w-28 rounded-full bg-gray10" />
          </div>
        </div>
      ) : hasAccess ? (
        // A plain div, not a button: the edit icon below is the only
        // interactive control in this state, and a <button> wrapping
        // another <button> is invalid HTML (React 19 flags it as a
        // hydration error).
        <div className={classes.row}>
          {identity}
          <Button
            type="button"
            variant="icon-solid"
            size="icon-lg"
            aria-label={t("profile_page_menu_edit_profile")}
            onClick={onEdit}
            className="bg-gray10 text-gray220"
          >
            <Edit3 size={17} />
          </Button>
        </div>
      ) : (
        <button type="button" onClick={onLogin} className={classes.row}>
          {identity}
        </button>
      )}
    </div>
  );
};

export default AccountCard;
