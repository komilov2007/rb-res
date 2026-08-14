import { MapPin, MessageCircle } from "lucide-react";
import type { useTranslations } from "next-intl";

type BannerLocationCardProps = {
  t: ReturnType<typeof useTranslations>;
};

const BannerLocationCard = ({ t }: BannerLocationCardProps) => {
  return (
    <div className="mt-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_4px_16px_var(--black40)]">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary10 text-primary">
            <MapPin size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold leading-3 text-gray220">
              {t("delivery_address")}
            </span>
            <span className="mt-1 block truncate text-sm font-extrabold leading-4 text-black">
              {t("select_address")}
            </span>
          </span>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary10 text-primary">
          <MessageCircle size={20} />
        </div>
      </div>
    </div>
  );
};

export default BannerLocationCard;
