import { ChevronDown, MapPin } from "lucide-react";

const Location = () => {
  return (
    <button className="flex shrink-0 items-center gap-2 text-left">
      <MapPin size={20} className="shrink-0 text-black" />
      <span className="text-sm font-semibold text-black">Tashkent</span>
      <ChevronDown size={15} className="shrink-0 text-black" />
    </button>
  );
};

export default Location;
