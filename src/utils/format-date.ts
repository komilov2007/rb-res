import { translate } from "@/utils/translate";

const pad = (value: number) => String(value).padStart(2, "0");

// Manual DD.MM.YYYY HH:mm formatting instead of Intl.DateTimeFormat — this
// project doesn't rely on locale data anywhere else, so a fixed format
// avoids environment-dependent surprises.
export const formatOrderDate = (isoDate: string) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return isoDate;

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// HH:mm timestamp under a chat bubble.
export const formatChatTime = (isoDate: string) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return "";

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// "Bugun" / "Kecha" / DD.MM.YYYY date-separator pill label for a chat
// message list.
export const getChatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return translate("shared.date.today");
  if (isSameDay(date, yesterday)) return translate("shared.date.yesterday");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};
