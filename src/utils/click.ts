export const isClick = () => {
  if (typeof window === "undefined") return false;
  return (
    process.env.NEXT_PUBLIC_CLICK === "true" ||
    process.env.NEXT_PUBLIC_BASE_URL_CLICK === window.location.hostname
  );
};
