import type { Metadata } from "next";
import { ReactQuery } from "@/provider/react-query";
import "./globals.css";
import { GeneralProvider } from "@/provider/general";

export const metadata: Metadata = {
  title: "RB Restaurant",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQuery>
          <GeneralProvider>{children}</GeneralProvider>
        </ReactQuery>
      </body>
    </html>
  );
}
