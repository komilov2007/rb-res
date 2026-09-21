import { Clock3 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { BOOKING_TIMES } from "@/constants/booking";

type TimePickerProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

const TimePicker = ({ value, placeholder, onChange }: TimePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-13 w-full items-center gap-3 rounded-xl border border-gray180 bg-gray10 px-5 text-left outline-none transition-colors focus:border-black"
        >
          <Clock3 size={20} className="shrink-0 text-gray220" />
          <span
            className={`text-sm font-normal ${
              value ? "text-black" : "text-gray220"
            }`}
          >
            {value || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pr-1">
          {BOOKING_TIMES.map((time) => {
            const isActive = value === time;

            return (
              <button
                key={time}
                type="button"
                onClick={() => onChange(time)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray10 text-black hover:bg-gray180"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
