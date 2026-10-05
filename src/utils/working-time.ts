import type { GeneralProps } from "@/types/general";

export type NextOpeningProps = {
  dayIndex: number;
  daysAhead: number;
  open: string;
  close: string;
};

export const formatTime = (time: string) => time.slice(0, 5);

const toMinutes = (time: string) => {
  const [hour, minute] = formatTime(time).split(":");

  return Number(hour) * 60 + Number(minute);
};

export const getDayIndex = (date: Date = new Date()) => date.getDay() || 7;

export const getNextOpening = (
  workingTime: GeneralProps["working_time"] | undefined,
  now: Date = new Date(),
): NextOpeningProps | null => {
  if (!workingTime) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIndex = getDayIndex(now);

  for (let daysAhead = 0; daysAhead <= 7; daysAhead += 1) {
    const dayIndex = ((todayIndex - 1 + daysAhead) % 7) + 1;
    const entry = workingTime[String(dayIndex)];

    if (!entry || entry.is_closed || entry.hours.length === 0) continue;

    const hours = [...entry.hours].sort(
      (a, b) => toMinutes(a.open) - toMinutes(b.open),
    );

    const hour =
      daysAhead === 0
        ? hours.find((item) => toMinutes(item.open) > nowMinutes)
        : hours[0];

    if (!hour) continue;

    return {
      dayIndex,
      daysAhead,
      open: formatTime(hour.open),
      close: formatTime(hour.close),
    };
  }

  return null;
};
