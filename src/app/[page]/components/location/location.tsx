import { ChevronDown, MapPin } from "lucide-react";
import Button from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocationStore } from "@/store/location";
import { useAuthStore } from "@/store/auth";

const Location = () => {
  const t = useTranslations();
  const address = useLocationStore((state) => state.address);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const handleOpenLocation = () => {
    if (hasAccess) {
      setLocationModal(true)();
      return;
    }

    setLoginModal(true)();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleOpenLocation}
      className="gap-3 text-left hover:bg-transparent"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-gray10 text-black">
        <MapPin size={19} />
      </span>
      <span className="flex max-w-[160px] flex-col text-left">
        <span className="text-[11px] font-medium leading-none text-gray220">
          Yetkazish manzili
        </span>
        <span className="title10 mt-1 truncate text-black">
          {address || t("select_address")}
        </span>
      </span>
      <ChevronDown size={16} className="shrink-0 text-gray220" />
    </Button>
  );
};

export default Location;
