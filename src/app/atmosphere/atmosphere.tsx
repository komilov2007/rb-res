"use client";

import { Suspense } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Breadcrumb from "@/components/breadcrumb";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ImageViewer from "@/components/image-viewer";
import ProductDetailMobile from "@/components/modal/product-detail";
import Button from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useOpenBooking } from "@/hooks/useOpenBooking";
import AtmosphereDesktop from "@/app/atmosphere/components/atmosphere-desktop";
import AtmosphereMobile from "@/app/atmosphere/components/atmosphere-mobile";
import AtmosphereState from "@/app/atmosphere/components/atmosphere-state";
import { usePage } from "@/app/atmosphere/usePage";

const AtmosphereContent = () => {
  const t = useTranslations();
  const router = useRouter();
  const goToBooking = useOpenBooking();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const {
    atmosphere,
    content,
    isLoading,
    isError,
    refetch,
    viewerIndex,
    openViewer,
    closeViewer,
  } = usePage();

  const renderBody = () => {
    if (isLoading) return <AtmosphereState status="loading" />;
    if (isError || !atmosphere || !content)
      return <AtmosphereState status="error" onRetry={() => refetch()} />;

    const title = atmosphere.title || t("atmosphere_title");

    return isDesktop ? (
      <AtmosphereDesktop
        title={title}
        desc={atmosphere.desc}
        content={content}
        onOpen={openViewer}
        onBook={goToBooking}
      />
    ) : (
      <AtmosphereMobile
        title={title}
        desc={atmosphere.desc}
        content={content}
        onOpen={openViewer}
      />
    );
  };

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
      <Breadcrumb items={[{ label: atmosphere?.title || t("atmosphere_title") }]} />

      <div className="scroll-hidden flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white lg:flex-auto lg:overflow-visible lg:bg-gray10">
        <section className="flex flex-1 flex-col lg:my-2 lg:overflow-clip lg:rounded-[30px] lg:bg-white">
          {renderBody()}
        </section>
        <ImageViewer
          images={content?.media ?? []}
          openIndex={viewerIndex}
          onClose={closeViewer}
        />
      </div>

      <div className="shrink-0 border-t border-gray180 bg-white pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
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

      <Footer />
      <ProductDetailMobile />
    </div>
  );
};

const Atmosphere = () => (
  <Suspense>
    <AtmosphereContent />
  </Suspense>
);

export { Atmosphere };

export default Atmosphere;
