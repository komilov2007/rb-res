import { Loader2, Search } from "lucide-react";

import Input from "@/components/ui/input";
import type { SearchAddress } from "@/types/yandex";

type LocationSearchProps = {
  value: string;
  isSearching: boolean;
  results: SearchAddress[];
  inputClassName: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onSelect: (address: SearchAddress) => void;
};

const LocationSearch = ({
  value,
  isSearching,
  results,
  inputClassName,
  onChange,
  onSearch,
  onSelect,
}: LocationSearchProps) => {
  return (
    <div className="relative min-w-0 flex-1">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearch();
          }
        }}
        IconStart={Search}
        placeholder="Manzilni qidirish"
        wrapperClassName={inputClassName}
      />
      {(isSearching || results.length > 0) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100000002] max-h-[360px] overflow-y-auto rounded-2xl bg-white">
          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray220">
              <Loader2 size={18} className="animate-spin text-primary" />
              Qidirilmoqda...
            </div>
          )}
          {results.map((item) => (
            <button
              key={`${item.address}-${item.coords.join(",")}`}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full flex-col px-4 py-3 text-left"
            >
              <span className="text-sm font-bold text-black">
                {item.name || item.address}
              </span>
              <span className="mt-1 line-clamp-1 text-xs font-medium text-gray220">
                {item.address || item.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
