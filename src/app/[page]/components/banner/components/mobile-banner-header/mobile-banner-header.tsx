import { SearchIcon } from "lucide-react";

import Button from "@/components/ui/button";
import Location from "@/app/[page]/components/location";

type MobileBannerHeaderProps = {
  searchLabel: string;
  onOpenSearch: () => void;
};

// Branches/profile icon buttons that used to sit alongside search here were
// dropped per an explicit design call — mobile's header now surfaces only
// the search action; branch and profile access still exist elsewhere
// (bottom nav's own Profil tab, the address/branch chip to the left of this
// row) so no functionality was actually lost, just this header's own extra
// entry points to it.
const MobileBannerHeader = ({
  searchLabel,
  onOpenSearch,
}: MobileBannerHeaderProps) => {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-16 w-full items-start justify-between gap-2 overflow-hidden bg-white px-3 pt-3 lg:hidden">
      {/* Capped at 200px (not the old max-w-full, which let it grow to
          fill the whole row now that only one icon sits opposite it) so a
          long address still truncates to a short single line instead of
          stretching the chip out. */}
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
