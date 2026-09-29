// Yandex Maps route links. Points are "latitude,longitude" strings.

type LatLng = { latitude: number; longitude: number };

// Route to `to`, from `from` — or, with no `from`, from wherever Yandex
// locates the user.
export const getYandexRouteUrl = (to: string, from = "") =>
  `https://yandex.uz/maps/?rtext=${from}~${to}&rtt=auto`;

const openInNewTab = (url: string) =>
  window.open(url, "_blank", "noopener,noreferrer");

// Opens device navigation to a branch — routed from the device's current
// position when geolocation is available/granted, otherwise a plain
// destination link.
export const openBranchDirections = (branch: LatLng) => {
  const branchPoint = `${branch.latitude},${branch.longitude}`;
  const fallbackUrl = getYandexRouteUrl(branchPoint);

  if (!navigator.geolocation) {
    openInNewTab(fallbackUrl);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const userPoint = `${coords.latitude},${coords.longitude}`;

      openInNewTab(getYandexRouteUrl(branchPoint, userPoint));
    },
    () => openInNewTab(fallbackUrl),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 },
  );
};
