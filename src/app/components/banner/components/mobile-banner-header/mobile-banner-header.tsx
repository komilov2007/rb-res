import { SearchIcon } from "lucide-react";

import Button from "@/components/ui/button";
import Location from "@/components/location";

type MobileBannerHeaderProps = {
  searchLabel: string;
  onOpenSearch: () => void;
};

const MobileBannerHeader = ({
  searchLabel,
  onOpenSearch,
}: MobileBannerHeaderProps) => {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-16 w-full items-start justify-between gap-2 overflow-hidden bg-white px-3 pt-3 lg:hidden">
      <div className="flex min-w-0 flex-1">
        <Location className="max-w-50" labelClassName="text-primary" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="icon-solid"
          size="icon-lg"
          onClick={onOpenSearch}
          aria-label={searchLabel}
          className="bg-gray10 text-gray220"
        >
          <SearchIcon size={20} />
        </Button>
      </div>
    </div>
  );
};

export default MobileBannerHeader;
