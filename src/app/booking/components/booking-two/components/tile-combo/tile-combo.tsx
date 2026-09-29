"use client";

import { useState, type ComponentType } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { TileError, TileIcon, TileLabel, tileClassName } from "../two-field";

export type ComboOption = {
  value: string;
  label: string;
  // Shown under the label, e.g. "Dam olish kuni".
  hint?: string;
  disabled?: boolean;
};

type TileComboProps = {
  Icon: ComponentType<{ size?: number }>;
  label: string;
  text: string;
  placeholder: string;
  maxLength: number;
  onTextChange: (text: string) => void;
  options: ComboOption[];
  selected: string;
  onSelect: (value: string) => void;
  emptyText: string;
  error?: string;
};

// A tile that is both typeable (masked input) and pickable (the chevron
// opens a list). Typing and picking write through the same form field.
const TileCombo = ({
  Icon,
  label,
  text,
  placeholder,
  maxLength,
  onTextChange,
  options,
  selected,
  onSelect,
  emptyText,
  error,
}: TileComboProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className={tileClassName(Boolean(error))} data-state={isOpen ? "open" : "closed"}>
          <TileIcon Icon={Icon} />
          <label className="min-w-0 flex-1">
            <TileLabel>{label}</TileLabel>
            <input
              value={text}
              inputMode="numeric"
              maxLength={maxLength}
              placeholder={placeholder}
              onChange={(event) => onTextChange(event.target.value)}
              // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
              className="w-full bg-transparent text-base font-normal leading-5 text-black outline-none placeholder:text-gray220/70"
            />
          </label>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={label}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray220"
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="max-h-72 w-64 overflow-y-auto rounded-xl p-1"
        >
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray220">{emptyText}</p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-black hover:bg-gray10 disabled:pointer-events-none disabled:opacity-40"
              >
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.hint && (
                    <span className="block text-xs text-red">{option.hint}</span>
                  )}
                </span>
                {option.value === selected && (
                  <Check size={16} className="shrink-0 text-primary" />
                )}
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>
      <TileError message={error} />
    </div>
  );
};

export default TileCombo;
