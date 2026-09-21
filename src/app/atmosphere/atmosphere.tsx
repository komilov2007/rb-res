"use client";

import { Suspense, useState } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import ImageViewer from "@/components/image-viewer";
import Button from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useOpenBooking } from "@/hooks/useOpenBooking";
import AtmosphereGallery from "@/components/atmosphere-gallery";

import AtmosphereFour from "./components/atmosphere-four";
import AtmosphereOne from "./components/atmosphere-one";
import AtmosphereThree from "./components/atmosphere-three";
import AtmosphereTwo from "./components/atmosphere-two";
import { ATMOSPHERE_MEDIA, type AtmosphereVariant } from "./constants";

const MOBILE_VARIANTS = {
  one: AtmosphereOne,
  two: AtmosphereTwo,
  three: AtmosphereThree,
  four: AtmosphereFour,
} satisfies Record<AtmosphereVariant, unknown>;

const FOOTER_CLASS_NAMES = {
  bar: "shrink-0 border-t border-gray180 bg-white pb-[max(16px,env(safe-area-inset-bottom))] pt-3",
  fade: "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-[max(16px,env(safe-area-inset-bottom))] pt-10",
  glass:
    "absolute inset-x-0 bottom-0 z-20 bg-white/10 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-3xl backdrop-saturate-150",
};

type AtmosphereProps = {
  // Mobile layout only; desktop always renders AtmosphereGallery.
  variant?: AtmosphereVariant;
};

// Standalone full-screen page (same shell as /booking and /chat, no
// PageLayout — so the floating Hand button doesn't sit over the footer).
// Reached from the Hand menu and from the /booking hero. The shell owns
// the back button, the "Bron qilish" footer and the shared full-screen
// viewer; the mobile body is whichever variant the caller picked.
const AtmosphereContent = ({ variant = "one" }: AtmosphereProps) => {
  const MobileVariant = MOBILE_VARIANTS[variant];
  const t = useTranslations();
  const router = useRouter();
  const goToBooking = useOpenBooking();
  // Only one layout is mounted, so the hidden one's video never loads.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Footer style per mobile variant: a plain bar (one, desktop), a dark
  // fade over full-screen scenes (two/three), or borderless frosted glass
  // over the blurred video (four).
  const footerStyle = isDesktop
    ? "bar"
    : variant === "two" || variant === "three"
      ? "fade"
      : variant === "four"
        ? "glass"
        : "bar";
  // One full-screen viewer for the hero video + gallery photos, so they
  // page through together (index 0 = video).
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <div className="relative flex h-dvh flex-col bg-gray10">
      {/* Mobile: floats over the video instead of a solid app-bar. */}
      <Button
        type="button"
        variant="plain"
        size="none"
        onClick={() => router.back()}
        aria-label={t("common_back")}
        className="absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] z-30 h-10 w-10 rounded-full bg-black/35 text-white backdrop-blur-md lg:hidden"
      >
        <ChevronLeft size={22} />
      </Button>

      <div className="sticky top-0 z-30 hidden shrink-0 rounded-b-2xl border-b border-gray180 bg-white lg:block">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.back()}
            aria-label={t("common_back")}
            className="shrink-0 text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="min-w-0 truncate text-base font-extrabold text-black">
            {t("atmosphere_title")}
          </h1>
        </div>
      </div>

      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white lg:bg-gray10">
        {isDesktop ? (
          <div className="mx-auto w-full max-w-6xl px-4 py-3">
            <div className="overflow-hidden rounded-xl bg-white px-6 py-6">
              <AtmosphereGallery />
            </div>
          </div>
        ) : (
          <>
            <MobileVariant onOpen={setViewerIndex} />
            <ImageViewer
              images={ATMOSPHERE_MEDIA}
              openIndex={viewerIndex}
              onClose={() => setViewerIndex(null)}
            />
          </>
        )}
      </div>

      <div className={FOOTER_CLASS_NAMES[footerStyle]}>
        <div className="mx-auto w-full max-w-xl px-4">
          <Button
            type="button"
            variant="primary-solid"
            size="primaryWide"
            onClick={goToBooking}
            className="h-12 w-full rounded-xl text-base"
          >
            {t("booking_submit")}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

// useSearchParams (shop_id) needs a Suspense boundary.
const Atmosphere = ({ variant }: AtmosphereProps) => (
  <Suspense>
    <AtmosphereContent variant={variant} />
  </Suspense>
);

export default Atmosphere;
