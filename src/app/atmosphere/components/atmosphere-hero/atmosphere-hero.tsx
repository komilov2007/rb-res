import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { ATMOSPHERE_VIDEO_SRC } from "../../constants";

type AtmosphereHeroProps = {
  onOpen: () => void;
};

const AtmosphereHero = ({ onOpen }: AtmosphereHeroProps) => {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("atmosphere_title")}
      className="relative block h-[62dvh] min-h-[380px] w-full overflow-hidden bg-black text-left"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      >
        <source src={ATMOSPHERE_VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/80" />

      <span className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md">
        <Maximize2 size={18} />
      </span>

    </button>
  );
};

export default AtmosphereHero;
