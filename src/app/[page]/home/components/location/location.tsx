import { ChevronDown, MapPin } from "lucide-react";
import Button from "@/components/ui/button";

const Location = () => {
  return (
    <Button variant="ghost" size="lg" className="gap-3 px-3 text-left">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-gray10 text-black">
        <MapPin size={19} className="shrink-0" />
      </span>
      <span className="max-w-[160px] truncate text-sm font-semibold text-black">
        Manzilni tanlang
      </span>
      <ChevronDown size={16} className="shrink-0 text-gray220" />
    </Button>
  );
};

export default Location;
