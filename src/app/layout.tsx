import type { Metadata } from "next";

import { Provider } from "@/provider/provider";
import { getLocale } from "@/utils/i18n";
import type { ChildrenProps } from "@/types/children";

import "./globals.css";
export const metadata: Metadata = {
  title: "RB Restaurant",
};

export default async function RootLayout({
  children,
}: Readonly<ChildrenProps>) {
  const locale = await getLocale();

  return <Provider locale={locale}>{children}</Provider>;
}
