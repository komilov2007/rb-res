import { type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { SearchIcon } from "lucide-react";
import SearchModal from "@/components/modal/search-modal";
import { Input } from "@/components/ui/input";
import { XButton } from "@/components/ui/sheet";
import { SearchIcon as SearchIconMobileBannerHeader } from "lucide-react";
import Button from "@/components/ui/button";
import Location from "@/components/location";

type MobileSearchScreenProps = {
  open: boolean;
  value: string;
  placeholder: string;
  onClose: () => void;
  onClear: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const MobileSearchScreen = ({
  open,
  value,
  placeholder,
  onClose,
  onClear,
  onChange,
}: MobileSearchScreenProps) => {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <XButton size="lg" onClick={onClose} />
        <Input
          autoFocus
          value={value}
          onChange={onChange}
          IconStart={SearchIcon}
          clearable
          onClear={onClear}
          placeholder={placeholder}
          wrapperClassName="!h-11 rounded-2xl bg-gray10 !px-4"
        />
      </div>
      <SearchModal open={open} value={value} fullscreen />
    </div>,
    document.body,
  );
};

export default MobileSearchScreen;

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
          <SearchIconMobileBannerHeader size={20} />
        </Button>
      </div>
    </div>
  );
};

export { MobileBannerHeader };
