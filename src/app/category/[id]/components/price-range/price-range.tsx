"use client";

import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { formatPrice } from "@/utils/format-price";

type PriceRangeProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

// Two native range inputs stacked on one track (no slider dependency
// installed in this project yet) — pointer-events are off everywhere except
// each thumb, so whichever thumb the user grabs is the one that moves.
const PriceRange = ({ min, max, value, onChange }: PriceRangeProps) => {
  const t = useTranslations();
  const [from, to] = value;
  const span = Math.max(max - min, 1);
  const fromPercent = ((from - min) / span) * 100;
  const toPercent = ((to - min) / span) * 100;
  const thumbClassName =
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(17,24,39,0.3)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary";

  const handleFromChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange([Math.min(Number(event.target.value), to), to]);
  };

  const handleToChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange([from, Math.max(Number(event.target.value), from)]);
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-base font-bold text-black">
        {t("price")} <span className="font-normal text-gray220">(UZS)</span>
      </h4>

      <div className="flex items-center gap-2">
        <div className="flex h-10 flex-1 items-center justify-between gap-1 rounded-lg bg-gray10 px-3 text-sm font-medium text-black">
          <span className="truncate">{formatPrice(from)}</span>
          <span className="shrink-0 text-xs font-normal text-gray220">
            {t("catalog_filters_from")}
          </span>
        </div>
        <div className="flex h-10 flex-1 items-center justify-between gap-1 rounded-lg bg-gray10 px-3 text-sm font-medium text-black">
          <span className="truncate">{formatPrice(to)}</span>
          <span className="shrink-0 text-xs font-normal text-gray220">
            {t("catalog_filters_to")}
          </span>
        </div>
      </div>

      <div className="relative flex h-5 w-full items-center">
        <div className="absolute h-1 w-full rounded-full bg-gray180" />
        <div
          className="absolute h-1 rounded-full bg-primary"
          style={{ left: `${fromPercent}%`, right: `${100 - toPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={from}
          onChange={handleFromChange}
          className={`pointer-events-none absolute h-1 w-full appearance-none bg-transparent ${thumbClassName}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={to}
          onChange={handleToChange}
          className={`pointer-events-none absolute h-1 w-full appearance-none bg-transparent ${thumbClassName}`}
        />
      </div>
    </div>
  );
};

export default PriceRange;
