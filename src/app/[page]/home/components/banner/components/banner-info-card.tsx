import type { ReactNode } from "react";

type BannerInfoCardProps = {
  icon?: ReactNode;
  label: string;
  value: string;
};

const BannerInfoCard = ({ icon, label, value }: BannerInfoCardProps) => {
  return (
    <div className="min-w-0 px-2">
      <div className="flex items-center gap-1.5">
        {icon && <span className="shrink-0 text-gray220">{icon}</span>}
        <p className="truncate text-[11px] font-semibold leading-3 text-gray220">
          {label}
        </p>
      </div>
      <h4 className="mt-1 truncate text-[10px] font-bold leading-3 text-black">
        {value}
      </h4>
    </div>
  );
};

export default BannerInfoCard;
