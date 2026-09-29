"use client";

import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

type LoginRequiredProps = {
  message: string;
};

// Shown on profile sub-pages whose data needs a logged-in customer.
const LoginRequired = ({ message }: LoginRequiredProps) => {
  const t = useTranslations();
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray180 bg-white px-6 py-10 text-center lg:border-0">
      <p className="text-sm font-normal text-gray220">{message}</p>
      <Button
        type="button"
        variant="plain"
        size="none"
        onClick={() => setLoginModal(true)}
        className="h-11 gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-white"
      >
        <LogIn size={16} />
        {t("login")}
      </Button>
    </div>
  );
};

export default LoginRequired;
