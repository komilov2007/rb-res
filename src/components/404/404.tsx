import { Store } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations();

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <div className="flex max-w-[340px] flex-col items-center text-center">
        <Store className="text-gray220" size={72} strokeWidth={2.2} />
        <h1 className="mt-2 text-2xl font-medium text-gray100">
          {t("shared_not_found_title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          {t("shared_not_found_description")}
        </p>
      </div>
    </main>
  );
}
