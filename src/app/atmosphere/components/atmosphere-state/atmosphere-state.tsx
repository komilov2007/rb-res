"use client";

import { IconPhotoOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";

type AtmosphereStateProps =
  | { status: "loading" }
  | { status: "error"; onRetry: () => void };

const AtmosphereSkeleton = () => (
  <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-7xl lg:gap-10 lg:px-5 lg:py-10">
    <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
      <div className="hidden lg:block">
        <div className="skeleton h-1 w-14 rounded-full" />
        <div className="skeleton mt-7 h-8 w-2/3 rounded-lg" />
        <div className="skeleton mt-5 h-4 w-full rounded-full" />
        <div className="skeleton mt-2 h-4 w-5/6 rounded-full" />
        <div className="skeleton mt-10 h-12 w-48 rounded-xl" />
      </div>
      <div className="skeleton h-[62dvh] min-h-[380px] rounded-none lg:h-[460px] lg:min-h-0 lg:rounded-[32px]" />
    </div>

    <div className="relative z-10 -mt-6 rounded-t-[24px] bg-white px-4 pb-6 pt-5 lg:mt-0 lg:px-0 lg:pt-0">
      <div className="lg:hidden">
        <div className="skeleton h-6 w-1/2 rounded-lg" />
        <div className="skeleton mt-3 h-3 w-full rounded-full" />
        <div className="skeleton mt-2 h-3 w-4/5 rounded-full" />
      </div>
      <div className="skeleton mt-6 h-5 w-32 rounded-full lg:mt-0 lg:h-7 lg:w-48" />
      <div className="mt-3 grid grid-cols-2 gap-2 lg:mt-5 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="skeleton h-40 rounded-xl lg:h-52 lg:rounded-3xl"
          />
        ))}
      </div>
    </div>
  </div>
);

const AtmosphereState = (props: AtmosphereStateProps) => {
  const t = useTranslations();

  if (props.status === "loading") return <AtmosphereSkeleton />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-[calc(env(safe-area-inset-top)+72px)] text-center lg:min-h-[480px] lg:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <IconPhotoOff size={28} />
      </span>
      <p className="mt-4 text-base font-medium text-black">
        {t("common_error")}
      </p>
      <Button
        type="button"
        variant="primary-solid"
        size="primaryWide"
        onClick={props.onRetry}
        className="mt-5 h-11 w-auto rounded-xl px-6 text-sm"
      >
        {t("common_retry")}
      </Button>
    </div>
  );
};

export default AtmosphereState;
