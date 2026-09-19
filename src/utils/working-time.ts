import type { GeneralProps } from "@/types/general";

export type NextOpeningProps = {
  // 1..7 (Monday..Sunday), matching GeneralProps["working_time"] keys.
  dayIndex: number;
  // 0 = later today, 1 = tomorrow, ...
  daysAhead: number;
  open: string;
  close: string;
};

const formatTime = (time: string) => time.slice(0, 5);

const toMinutes = (time: string) => {
  const [hour, minute] = formatTime(time).split(":");

  return Number(hour) * 60 + Number(minute);
};

// Monday=1..Sunday=7 — the same getDay() || 7 conversion src/utils/banner.ts
// and src/components/branch-info-sheet already use for working_time lookups.
const getDayIndex = (date: Date) => date.getDay() || 7;

// The first working window the shop opens in from `now` onward: a later
// window today if one exists, otherwise the first window of the next day
// that isn't a day off (scanning a full week). null when the schedule is
// missing or every day is closed.
//
// Needed because "is_closed for today" is NOT the same as "closed for the
// rest of today" — a shop that opens at 10:00 is closed at 08:00 but must
// still say "opens today at 10:00", not "today is a day off".
export const getNextOpening = (
  workingTime: GeneralProps["working_time"] | undefined,
  now: Date = new Date(),
): NextOpeningProps | null => {
  if (!workingTime) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIndex = getDayIndex(now);

  for (let daysAhead = 0; daysAhead < 7; daysAhead += 1) {
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
