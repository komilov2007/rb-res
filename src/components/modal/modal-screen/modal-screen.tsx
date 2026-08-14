"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import Button from "@/components/ui/button";

type ModalScreenProps = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

const ModalScreen = ({
  title,
  icon,
  children,
  onClose,
  className = "",
}: ModalScreenProps) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 lg:flex lg:items-center lg:justify-center">
      <div
        className={`flex h-dvh w-full flex-col gap-4 bg-white p-4 lg:h-auto lg:max-h-[720px] lg:max-w-[440px] lg:rounded-3xl ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-black">
              {icon}
              <h2 className="text-xl font-extrabold">{title}</h2>
            </div>
            <CloseButton onClose={onClose} />
          </div>
        )}
        {children}
      </div>
      <button
        aria-label="Modalni yopish"
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export const CloseButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <Button
      variant="soft"
      size="icon"
      onClick={onClose}
      className="h-10 w-10 rounded-full"
    >
      <X size={20} />
    </Button>
  );
};

export default ModalScreen;
