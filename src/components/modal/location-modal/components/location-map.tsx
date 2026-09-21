import { useRef } from "react";
import { Navigation } from "lucide-react";
import { Map, YMaps, type YMapsApi } from "react-yandex-maps";

import { YANDEX_LANG } from "@/constants/yandex";
import type {
  BoundsChangeEvent,
  Coordinates,
  MapInstance,
} from "@/types/yandex";

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

type MapEvent = { get: (key: string) => unknown };

// The slice of the ymaps API used to keep a default placemark on the map
// centre (react-yandex-maps doesn't type these).
type CenterPin = {
  geometry: { setCoordinates: (coordinates: Coordinates) => void };
};
type PinMap = MapInstance & {
  geoObjects: { add: (object: unknown) => void };
  events: { add: (type: string, handler: (event: MapEvent) => void) => void };
  options: {
    get: (key: "projection") => {
      fromGlobalPixels: (point: [number, number], zoom: number) => Coordinates;
    };
  };
};
type PinYMapsApi = YMapsApi & {
  Placemark: new (
    geometry: Coordinates,
    properties: Record<string, never>,
    options: Record<string, unknown>,
  ) => CenterPin;
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
  const apiRef = useRef<PinYMapsApi | null>(null);
  const mapRef = useRef<PinMap | null>(null);
  const pinnedMapRef = useRef<PinMap | null>(null);

  // The picked point is always the map centre (dragging the map moves the
  // point, reverse-geocoded on action end). The marker is Yandex's own
  // default placemark, kept on that centre: during the drag/zoom animation
  // (actiontick, from the in-flight tick's pixel centre) and after any view
  // change (boundschange). Transparent to pointer events, so dragging on it
  // still drags the map. Re-attached whenever the <Map> is re-keyed.
  const attachCenterPin = () => {
    const api = apiRef.current;
    const map = mapRef.current;

    if (!api || !map || pinnedMapRef.current === map) return;

    pinnedMapRef.current = map;

    const pin = new api.Placemark(
      map.getCenter(),
      {},
      {
        hasBalloon: false,
        hasHint: false,
        interactivityModel: "default#transparent",
      },
    );

    map.geoObjects.add(pin);
    map.events.add("actiontick", (event) => {
      const tick = event.get("tick") as {
        globalPixelCenter: [number, number];
        zoom: number;
      };

      pin.geometry.setCoordinates(
        map.options
          .get("projection")
          .fromGlobalPixels(tick.globalPixelCenter, tick.zoom),
      );
    });
    map.events.add("boundschange", (event) => {
      pin.geometry.setCoordinates(event.get("newCenter") as Coordinates);
    });
  };

  return (
    <div className="location-yandex-map relative h-full min-h-0 w-full overflow-hidden bg-gray10">
      <YMaps
        query={{
          load: "Map,Placemark",
          // @ts-expect-error react-yandex-maps types do not include Uzbek, but Yandex accepts it.
          lang: YANDEX_LANG,
          coordorder: "longlat",
          apikey: yandexKey,
        }}
      >
        <Map
          key={mapKey}
          state={mapState}
          onLoad={(api) => {
            apiRef.current = api as PinYMapsApi;
            attachCenterPin();
            onLoad(api);
          }}
          instanceRef={(instance) => {
            mapRef.current = (instance as PinMap | null) ?? null;
            setMapInstance((instance as MapInstance | null) ?? null);
            attachCenterPin();
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
