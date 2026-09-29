import { YANDEX_KEYS } from "@/constants/yandex";
import type { YandexGeocoderResponse } from "@/types/yandex";

type RequestYandexGeocodeProps = {
  params: Record<string, string>;
  keyIndex: number;
  setKeyIndex: (index: number) => void;
};

export const requestYandexGeocode = async ({
  params,
  keyIndex,
  setKeyIndex,
}: RequestYandexGeocodeProps) => {
  for (let attempt = 0; attempt < YANDEX_KEYS.length; attempt += 1) {
    const nextIndex = (keyIndex + attempt) % YANDEX_KEYS.length;
    const nextKey = YANDEX_KEYS[nextIndex];
    const searchParams = new URLSearchParams({
      ...params,
      apikey: nextKey,
    });
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?${searchParams}`,
    );

    if (response.ok) {
      if (nextIndex !== keyIndex) {
        setKeyIndex(nextIndex);
      }

      return (await response.json()) as YandexGeocoderResponse;
    }

    if (response.status !== 403 && response.status !== 429) {
      break;
    }
  }

  throw new Error("Yandex API key is invalid");
};
