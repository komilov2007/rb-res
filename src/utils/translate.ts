import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import tr from "../../messages/tr.json";
import uz from "../../messages/uz.json";
import { getLanguage } from "@/utils/is-server";
import { defaultLocale, type LocaleProps } from "@/types/i18n";

type Messages = Record<string, unknown>;

const MESSAGES: Record<LocaleProps, Messages> = { uz, ru, en, tr };

const lookup = (messages: Messages, key: string) =>
  key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Messages)[part]
          : undefined,
      messages,
    );

// For code outside React components/hooks (yup schema messages, toasts
// fired from plain utils, request interceptors) where useTranslations()
// isn't available. Inside components/hooks, use useTranslations() instead.
// Supports simple {name} placeholders only.
export const translate = (
  key: string,
  values?: Record<string, string | number>,
) => {
  // Same NEXT_LOCALE cookie the server reads (src/utils/i18n.ts), so this
  // always agrees with the locale next-intl rendered the page in.
  const locale = getLanguage();
  const message =
    lookup(MESSAGES[locale], key) ?? lookup(MESSAGES[defaultLocale], key);

  if (typeof message !== "string") return key;
  if (!values) return message;

  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
};
