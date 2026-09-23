// "7" -> "07", for the variants' "01 / 12" counters.
export const pad = (value: number) => String(value).padStart(2, "0");
