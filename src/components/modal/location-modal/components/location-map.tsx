import { Navigation } from "lucide-react";
import { Map, YMaps, type YMapsApi } from "react-yandex-maps";

import LocationPinIcon from "@/assets/icons/location-pin-icon";
import { YANDEX_LANG } from "@/constants/yandex";
import type { BoundsChangeEvent, MapInstance } from "@/types/yandex";

type LocationMapProps = {
  yandexKey: string;
  mapKey: number;
  mapState: {
    zoom: number;
    center: [number, number];
  };
  className: string;
  locationButtonClassName?: string;
  onLoad: (api: YMapsApi) => void;
  onBoundsChange: (event: BoundsChangeEvent) => void;
  onCurrentLocation: () => void;
  setMapInstance: (instance: MapInstance | null) => void;
};

const LocationMap = ({
  yandexKey,
  mapKey,
  mapState,
  className,
  locationButtonClassName = "bottom-4",
  onLoad,
  onBoundsChange,
  onCurrentLocation,
  setMapInstance,
}: LocationMapProps) => {
  return (
    <div className="location-yandex-map relative h-full min-h-0 w-full overflow-hidden bg-gray10">
      <style jsx global>{`
        .location-yandex-map [class*="controls-pane"],
        .location-yandex-map [class*="controls__toolbar"],
        .location-yandex-map [class*="float-button"],
        .location-yandex-map [class*="search"],
        .location-yandex-map [class*="traffic"],
        .location-yandex-map [class*="type-selector"],
        .location-yandex-map [class*="fullscreen"],
        .location-yandex-map [class*="ruler"],
        .location-yandex-map [class*="geolocation"],
        .location-yandex-map [class*="copyright"],
        .location-yandex-map [class*="gototech"],
        .location-yandex-map [class*="gotoymaps"],
        .location-yandex-map [class*="scale"] {
          display: none !important;
        }
      `}</style>
      <YMaps
        query={{
          load: "Map",
          // @ts-expect-error react-yandex-maps types do not include Uzbek, but Yandex accepts it.
          lang: YANDEX_LANG,
          coordorder: "longlat",
          apikey: yandexKey,
        }}
      >
        <Map
          key={mapKey}
          state={mapState}
          onLoad={onLoad}
          instanceRef={(instance) => {
            setMapInstance((instance as MapInstance | null) ?? null);
          }}
          onActionEnd={onBoundsChange}
          modules={["geocode", "SuggestView"]}
          defaultOptions={{
            controls: ["zoomControl"],
            suppressMapOpenBlock: true,
          }}
          options={{
            controls: ["zoomControl"],
            suppressMapOpenBlock: true,
          }}
          className={className}
        />
      </YMaps>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[100000000] -translate-x-1/2 -translate-y-full">
        <LocationPinIcon className="text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.14)]" />
      </div>

      <button
        type="button"
        onClick={onCurrentLocation}
        className={`absolute right-4 z-[100000000] flex h-11 w-11 items-center justify-center rounded-full bg-white text-black ${locationButtonClassName}`}
      >
        <Navigation size={20} fill="currentColor" />
      </button>
    </div>
  );
};

export default LocationMap;
