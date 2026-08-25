"use client";

import { ROUTER } from "@/constants/router";
import { useGeneral } from "@/hooks/useGeneral";

const Logo = () => {
  const { data, isLoading } = useGeneral();
  const logo = data?.data.logo;
  if (isLoading) return null;
  if (!logo) return null;

  return (
    <a href={ROUTER.HOME} className="flex h-10 w-[120px] shrink-0 items-center">
      <img className="h-full w-full object-contain" src={logo} alt={logo} />
    </a>
  );
};

export default Logo;
