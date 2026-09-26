import { IconPhoneFilled } from "@tabler/icons-react";

import Language from "@/components/language";
import { OrdersTopbarLink } from "@/components/header/components/orders-preview";

type HeaderTopbarProps = {
  phone?: string | null;
};

// Desktop-only thin row above the header: the shop phone and the language
// switcher.
const HeaderTopbar = ({ phone }: HeaderTopbarProps) => {
  return (
    <div className="relative left-0 top-0 z-50 hidden h-9 w-full border-b border-gray180 bg-white lg:block">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-5">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm font-medium text-primary! transition-opacity hover:opacity-75"
          >
            <IconPhoneFilled size={17} className="text-primary" />
            {phone}
          </a>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-5">
          <OrdersTopbarLink />
          <Language variant="topbar" />
        </div>
      </div>
    </div>
  );
};

export default HeaderTopbar;
