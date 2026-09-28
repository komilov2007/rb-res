// Detects whether the app is running inside the Click superapp's mini-app
// webview (either forced via env for a Click-only deployment, or matched by
// hostname), mirroring rb-shop's src/lib/click.ts.
export const isClick = () => {
  if (typeof window === "undefined") return false;
  return (
    process.env.NEXT_PUBLIC_CLICK === "true" ||
    process.env.NEXT_PUBLIC_BASE_URL_CLICK === window.location.hostname
  );
};
