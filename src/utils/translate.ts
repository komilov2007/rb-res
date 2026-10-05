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

export const translate = (
  key: string,
  values?: Record<string, string | number>,
) => {
  const locale = getLanguage();
  const message =
    lookup(MESSAGES[locale], key) ?? lookup(MESSAGES[defaultLocale], key);

  if (typeof message !== "string") return key;
  if (!values) return message;

  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
};
