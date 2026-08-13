"use client";

import { LogoSkeleton } from "@/components/ui/skleton";
import { useGeneral } from "@/hooks/useGeneral";

const Logo = () => {
  const { data, isLoading } = useGeneral();
  const logo = data?.data.logo;
  if (isLoading) return <LogoSkeleton />;
  if (!logo) return null;

  return (
    <div className="flex h-10 w-[120px] shrink-0 items-center">
      <img className="h-full w-full object-contain" src={logo} alt={logo} />
    </div>
  );
};

export default Logo;
