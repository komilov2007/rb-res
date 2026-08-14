import type { Metadata } from "next";
import { ReactQuery } from "@/provider/react-query";
import "./globals.css";
import { GeneralProvider } from "@/provider/general";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "@/utils/i18n";

export const metadata: Metadata = {
  title: "RB Restaurant",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQuery>
            <Suspense>
              <GeneralProvider>{children}</GeneralProvider>
            </Suspense>
          </ReactQuery>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
