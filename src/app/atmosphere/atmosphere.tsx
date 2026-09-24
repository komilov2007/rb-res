"use client";

import { Suspense, useState } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Footer from "@/components/footer";
import Header from "@/components/header";
import ImageViewer from "@/components/image-viewer";
import ProductDetailMobile from "@/components/modal/product-detail";
import Button from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useOpenBooking } from "@/hooks/useOpenBooking";

import Breadcrumb from "@/components/breadcrumb";

import AtmosphereDesktop from "./components/atmosphere-desktop";
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

// Mobile "Bron qilish" footer, per variant: a plain bar (one), a dark fade
// over full-screen scenes (two/three), or borderless frosted glass over
// the blurred video (four). Desktop puts the button inside the page section.
const FOOTER_CLASS_NAMES = {
  bar: "shrink-0 border-t border-gray180 bg-white pb-[max(16px,env(safe-area-inset-bottom))] pt-3",
  fade: "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-[max(16px,env(safe-area-inset-bottom))] pt-10",
  glass:
    "absolute inset-x-0 bottom-0 z-20 bg-white/10 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-3xl backdrop-saturate-150",
};

const FOOTER_STYLES = {
  one: "bar",
  two: "fade",
  three: "fade",
  four: "glass",
} satisfies Record<AtmosphereVariant, keyof typeof FOOTER_CLASS_NAMES>;

type AtmosphereProps = {
  // Mobile layout only; desktop always renders AtmosphereDesktop.
  variant?: AtmosphereVariant;
};

// Mobile: standalone full-screen page (same shell as /booking and /chat,
// no PageLayout — so the floating Hand button doesn't sit over the
// footer); the shell owns the back button, the "Bron qilish" footer and
// the shared full-screen viewer, the body is the variant the caller picked.
// Desktop: site Header/Footer like home, breadcrumb, one full-bleed section
// with AtmosphereDesktop (hero, bento gallery, booking band) — the same for
// every variant.
// Reached from the Hand menu and from the /booking hero.
const AtmosphereContent = ({ variant = "one" }: AtmosphereProps) => {
  const MobileVariant = MOBILE_VARIANTS[variant];
  const t = useTranslations();
  const router = useRouter();
  const goToBooking = useOpenBooking();
  // Only one layout is mounted, so the hidden one's video never loads.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // One full-screen viewer for the hero video + gallery photos, so they
  // page through together (index 0 = video).
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const bookingButton = (
    <Button
      type="button"
      variant="primary-solid"
      size="primaryWide"
      onClick={goToBooking}
      className="h-12 w-full rounded-xl text-base lg:w-auto lg:px-8"
    >
      {t("booking_submit")}
      <ArrowRight size={18} />
    </Button>
  );

  return (
    <div className="relative flex h-dvh flex-col bg-gray10 lg:h-auto lg:min-h-screen">
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

      <div className="hidden lg:block">
        <Header />
      </div>
      <Breadcrumb items={[{ label: t("atmosphere_title") }]} />

      {/* Desktop: the window scrolls (no inner scroller); one full-bleed
          white section (like the category page) with an 8px gray gap above
          and below, content aligned to the header's max-w-7xl container. */}
      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white lg:flex lg:flex-auto lg:flex-col lg:overflow-visible lg:bg-gray10">
        {isDesktop ? (
          <section className="my-2 flex flex-1 flex-col overflow-hidden rounded-[30px] bg-white">
            <AtmosphereDesktop onOpen={setViewerIndex} onBook={goToBooking} />
          </section>
        ) : (
          <MobileVariant onOpen={setViewerIndex} />
        )}
        <ImageViewer
          images={ATMOSPHERE_MEDIA}
          openIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      </div>

      <div
        className={`${FOOTER_CLASS_NAMES[FOOTER_STYLES[variant]]} lg:hidden`}
      >
        <div className="mx-auto w-full max-w-xl px-4">{bookingButton}</div>
      </div>

      <Footer />
      {/* Header search results open the product detail modal. */}
      <ProductDetailMobile />
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
