"use client";

import { IconPencilFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import { RadioMark, getOptionClassName } from "@/components/ui/radio-mark";
import { useLanguage } from "@/components/language/language";
import { languages } from "@/constants/language";

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

type LanguageOptionsProps = {
  onSelect?: () => void;
};

const LanguageOptions = ({ onSelect }: LanguageOptionsProps) => {
  const { safeValue, availableLanguages, handleChangeLanguage } = useLanguage();

  return availableLanguages.map((key) => {
    const language = languages[key];
    const Icon = language.Icon;
    const checked = key === safeValue;

    return (
      <button
        key={key}
        type="button"
        data-language={key}
        onClick={() => {
          handleChangeLanguage(key);
          onSelect?.();
        }}
        className={`flex h-12 items-center gap-3 rounded-2xl px-3 text-left ${getOptionClassName(checked)}`}
      >
        <Icon />
        <span className="flex-1 text-sm font-normal text-black">
          {language.label}
        </span>
        <RadioMark checked={checked} />
      </button>
    );
  });
};

export { LanguageOptions };
