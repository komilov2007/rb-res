import { Phone } from "lucide-react";

import { IconFlagUzbek } from "@/assets/icons/flag-uzbek";

const PhoneStart = () => {
  return (
    <>
      <Phone size={18} className="shrink-0 text-gray220" />
      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
        <IconFlagUzbek />
      </span>
      <span className="shrink-0 text-sm font-medium text-black">+998</span>
    </>
  );
};

export default PhoneStart;
