"use client";

import { ROUTER } from "@/constants/router";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";

const Logo = () => {
  const { data, isLoading } = useGeneral();
  const { shopid } = useShopId();
  const logo = data?.data.logo;
  const href = `${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`;

  if (isLoading) return null;
  if (!logo) return null;

  return (
    <a href={href} className="flex h-10 w-[120px] shrink-0 items-center">
      <img className="h-full w-full object-contain" src={logo} alt={logo} />
    </a>
  );
};

export default Logo;
