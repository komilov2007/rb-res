import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Geist } from "next/font/google";

import CartDrawer from "@/app/[page]/cart";
import { ReactQuery } from "@/provider/react-query";
import { GeneralProvider } from "@/provider/general";
import { AuthProvider } from "@/provider/auth";
import LoginModal from "@/components/modal/login-modal";
import SignupModal from "@/components/modal/signup-modal";
import ProfileModal from "@/components/modal/profile-modal";
import LocationModal from "@/components/modal/location-modal";

import { cn } from "@/lib/utils";
import { getMessages } from "@/utils/i18n";
import type { ChildrenProps } from "@/types/children";
import type { LocaleProps } from "@/types/i18n";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

type ProviderProps = ChildrenProps & {
  locale: LocaleProps;
};

export const Provider = async ({ locale, children }: ProviderProps) => {
  const messages = await getMessages(locale);

  return (
    <html lang={locale} className={cn("font-sans", geist.variable)}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQuery>
            <Suspense>
              <GeneralProvider>
                <AuthProvider>
                  <div className="min-h-screen">
                    {children}
                    <CartDrawer />
                    <LoginModal />
                    <SignupModal />
                    <ProfileModal />
                    <Suspense fallback={null}>
                      <LocationModal />
                    </Suspense>
                  </div>
                </AuthProvider>
              </GeneralProvider>
            </Suspense>
          </ReactQuery>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
