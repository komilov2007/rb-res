"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import XButton from "@/components/ui/x-button";

type ModalScreenProps = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  placement?: "screen" | "bottom";
};

const ModalScreen = ({
  title,
  icon,
  children,
  onClose,
  className = "",
  placement = "screen",
}: ModalScreenProps) => {
  const t = useTranslations();
  const isBottom = placement === "bottom";

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black/30 ${
        isBottom
          ? "flex items-end lg:items-center lg:justify-center"
          : "lg:flex lg:items-center lg:justify-center"
      }`}
    >
      <div
        className={`flex w-full flex-col gap-4 bg-white p-4 ${
          isBottom
            ? "max-h-[85dvh] rounded-t-3xl lg:max-w-[440px] lg:rounded-3xl"
            : "h-dvh lg:h-auto lg:max-h-[720px] lg:max-w-[440px] lg:rounded-3xl"
        } ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-black">
              {icon}
              <h2 className="text-xl font-medium">{title}</h2>
            </div>
            <CloseButton onClose={onClose} />
          </div>
        )}
        {children}
      </div>
      <button
        aria-label={t("shared_close_modal")}
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export const CloseButton = ({ onClose }: { onClose: () => void }) => {
  return <XButton size="lg" onClick={onClose} />;
};

export default ModalScreen;
