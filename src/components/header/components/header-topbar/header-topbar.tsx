import { ChevronDown, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import Language from "@/components/language";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { BranchProps } from "@/types/branch";

type HeaderTopbarProps = {
  phone?: string | null;
  branches?: BranchProps[];
  branchesOpen: boolean;
  onBranchesOpenChange: (open: boolean) => void;
  onSelectBranch: (branch: BranchProps) => void;
};

const HeaderTopbar = ({
  phone,
  branches,
  branchesOpen,
  onBranchesOpenChange,
  onSelectBranch,
}: HeaderTopbarProps) => {
  const t = useTranslations();
  const hasBranches = Boolean(branches?.length);

  return (
    <div className="relative left-0 top-0 z-50 hidden h-[45px] w-full border-b border-gray180 bg-white lg:block">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm font-medium text-black! transition-opacity hover:opacity-75"
            >
              <Phone size={17} strokeWidth={2.5} className="text-gray220" />
              {phone}
            </a>
          )}

          <nav className="flex min-w-0 items-center gap-5 text-sm font-medium text-gray220">
            {hasBranches && (
              <Popover open={branchesOpen} onOpenChange={onBranchesOpenChange}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex max-w-[220px] items-center gap-1.5 transition-colors hover:text-black"
                  >
                    <MapPin
                      size={15}
                      strokeWidth={2.3}
                      className="shrink-0 text-gray220"
                    />
                    <span>{t("home_header_branches")}</span>
                    <ChevronDown size={14} className="shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={10}
                  className="w-64 overflow-hidden rounded-2xl border-gray180 p-1"
                >
                  <div className="max-h-80 overflow-y-auto">
                    {branches?.map((branch) => (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => onSelectBranch(branch)}
                        className="flex w-full min-w-0 items-start gap-2 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-gray10"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220">
                          <MapPin size={16} strokeWidth={2.4} />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium leading-5 text-black">
                            {branch.name}
                          </span>
                          <span className="w-full truncate whitespace-nowrap text-xs font-medium leading-4 text-gray220">
                            {branch.address}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </nav>
        </div>

        <Language variant="topbar" />
      </div>
    </div>
  );
};

export default HeaderTopbar;
