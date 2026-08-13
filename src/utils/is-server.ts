export const isServer = () => {
  return typeof window === "undefined";
};

export const getLanguage = () => {
  if (isServer()) return "uz";

  const firstSegment = window.location.pathname.split("/")[1];

  if (["uz", "ru", "en", "tr"].includes(firstSegment)) {
    return firstSegment;
  }

  return "uz";
};
