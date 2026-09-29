"use client";

import { IconPencilFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";

// Exact class strings per placement — the desktop sidebar section pads its rows,
// the mobile page doesn't.
const CLASSES = {
  mobile: {
    card: "rounded-2xl border border-gray180 bg-white p-2",
    skeleton: "flex items-center gap-4",
    row: "flex w-full items-center gap-4 text-left",
  },
  sidebar: {
    card: "py-3",
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
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray10 text-sm font-medium text-black">
        {initials || "U"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="info-label truncate">{name}</p>
        <p className="info-value truncate">
          {phone}
        </p>
      </div>
    </>
  );

  return (
    <div className={classes.card}>
      {isLoading ? (
        <div className={classes.skeleton}>
          <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-36 rounded-full" />
            <div className="skeleton h-3 w-28 rounded-full" />
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
            <IconPencilFilled size={17} />
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
