import { type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { SearchIcon } from "lucide-react";

import SearchModal from "@/components/modal/search-modal";
import Input from "@/components/ui/input";
import XButton from "@/components/ui/x-button";

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
