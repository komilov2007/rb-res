"use client";

import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { signUp } from "@/apis/auth";
import { ROUTER } from "@/constants/router";
import { setUser } from "@/lib/user";
import { useShopid } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import type { UserInfo } from "@/types/profile";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatPhone, getLocalPhone } from "@/utils/format-number";

import LoginRequired from "../login-required";

// Shared by /profile/edit (its own page) and the bare /profile route's
// desktop content pane (shown there by default instead of a placeholder) —
// same name/phone form and mutation logic in both places.
const EditProfileForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopid();
  const queryClient = useQueryClient();
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [firstname, setFirstname] = useState(auth?.firstname ?? "");
  const [error, setError] = useState<string | null>(null);

  const goBackToProfile = () =>
    router.push(`${ROUTER.PROFILE}${shopid ? `?shop_id=${shopid}` : ""}`);

  const update = useMutation({
    mutationFn: () =>
      signUp(
        { firstname: firstname.trim(), phone: getLocalPhone(auth?.phone) },
        shopid as string,
      ),
    onSuccess: (response) => {
      if (auth) {
        const nextAuth = { ...auth, firstname: response.data.firstname };

        setAuth(nextAuth);

        if (shopid) setUser(shopid, nextAuth);
      }

      // The profile page displays useProfile()'s query cache, not the auth
      // store — patch it directly so the new name shows immediately instead
      // of waiting on the invalidated query's refetch to land.
      queryClient.setQueryData<{ data: UserInfo } | undefined>(
        ["profile"],
        (previous) =>
          previous && {
            ...previous,
            data: { ...previous.data, firstname: response.data.firstname },
          },
      );

      void queryClient.invalidateQueries({ queryKey: ["general", shopid] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("profile_page.edit.name_saved"));
      goBackToProfile();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, t("common.error")));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shopid || update.isPending) return;

    if (!firstname.trim()) {
      setError(t("profile_page.edit.name_required"));
      return;
    }

    setError(null);
    update.mutate();
  };

  if (!hasAccess) {
    return <LoginRequired message={t("profile_page.edit.login_required")} />;
  }

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl border border-gray180 bg-white p-4 lg:border-0 lg:p-0"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-2">
        <span className="text-xs font-normal text-gray220">
          {t("first_name")}
        </span>
        <Input
          autoFocus
          value={firstname}
          onChange={(event) => {
            setFirstname(event.target.value);
            if (error) setError(null);
          }}
          className="font-normal text-black"
          wrapperClassName={`max-h-12 ${error ? "!border-red" : ""}`}
        />
        {error && <span className="text-xs text-red">{error}</span>}
      </label>

      {/* Read-only — phone changes require a separate SMS-confirmation flow
          that doesn't exist in this project yet, so it's shown for context
          only, not editable here. */}
      <label className="flex flex-col gap-2">
        <span className="text-xs font-normal text-gray220">
          {t("phone_number")}
        </span>
        <Input
          disabled
          readOnly
          value={
            auth?.phone ? `+998 ${formatPhone(getLocalPhone(auth.phone))}` : ""
          }
          className="font-medium text-[#3D3D3D]"
          wrapperClassName="max-h-12 bg-gray10"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          size="primaryWide"
          onClick={goBackToProfile}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          variant="primary-solid"
          size="primaryWide"
          disabled={!shopid || update.isPending}
        >
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
