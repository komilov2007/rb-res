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

import AtmosphereDesktopPreview from "./components/atmosphere-desktop-preview";
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

const FOOTER_STYLES = {
  one: "bar",
  two: "fade",
  three: "fade",
  four: "glass",
} satisfies Record<AtmosphereVariant, keyof typeof FOOTER_CLASS_NAMES>;

type AtmosphereProps = {
  variant?: AtmosphereVariant;
};

const AtmosphereContent = ({ variant = "one" }: AtmosphereProps) => {
  const MobileVariant = MOBILE_VARIANTS[variant];
  const t = useTranslations();
  const router = useRouter();
  const goToBooking = useOpenBooking();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
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

      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white lg:flex lg:flex-auto lg:flex-col lg:overflow-visible lg:bg-gray10">
        {isDesktop ? (
          <section className="my-2 flex flex-1 flex-col overflow-clip rounded-[30px] bg-white">
            <AtmosphereDesktopPreview
              onOpen={setViewerIndex}
              onBook={goToBooking}
            />
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
      <ProductDetailMobile />
    </div>
  );
};

const Atmosphere = ({ variant }: AtmosphereProps) => (
  <Suspense>
    <AtmosphereContent variant={variant} />
  </Suspense>
);

export default Atmosphere;
