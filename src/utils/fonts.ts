import localFont from "next/font/local";

export const onest = localFont({
  preload: true,
  variable: "--font-onest",
  src: [
    { path: "../assets/fonts/OnestThin1602-hint.woff2", weight: "200" },
    { path: "../assets/fonts/OnestLight1602-hint.woff2", weight: "300" },
    { path: "../assets/fonts/OnestRegular1602-hint.woff2", weight: "400" },
    { path: "../assets/fonts/OnestMedium1602-hint.woff2", weight: "500" },
    { path: "../assets/fonts/OnestBlack1602-hint.woff2", weight: "600" },
    { path: "../assets/fonts/OnestBold1602-hint.woff2", weight: "700" },
    { path: "../assets/fonts/OnestExtraBold1602-hint.woff2", weight: "800" },
  ],
});
