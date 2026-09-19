import type { YMapsApi } from "react-yandex-maps";

export type Coordinates = [number, number];

export type BoundsChangeEvent = {
  originalEvent?: {
    newCenter?: Coordinates;
    newZoom?: number;
  };
  get?: (key: string) => unknown;
};

export type GeocodeResponse = {
  geoObjects?: {
    get: (index: number) =>
      | {
          properties?: {
            get: (key: string) => unknown;
          };
          geometry?: {
            getCoordinates: () => Coordinates;
          };
        }
      | undefined;
  };
};

export type YandexGeocoderResponse = {
  response?: {
    GeoObjectCollection?: {
      featureMember?: {
        GeoObject?: {
          name?: string;
          description?: string;
          Point?: {
            pos?: string;
          };
          metaDataProperty?: {
            GeocoderMetaData?: {
              text?: string;
            };
          };
        };
      }[];
    };
  };
};

export type SearchAddress = {
  name: string;
  description: string;
  address: string;
  coords: Coordinates;
};

export type MapInstance = {
  getCenter: () => Coordinates;
  setCenter: (
    center: Coordinates,
    zoom?: number,
    options?: { duration?: number; timingFunction?: string },
  ) => void;
};
export type BranchMapInstance = {
  geoObjects: {
    add: (object: unknown) => void;
    removeAll: () => void;
  };
};

export type BranchYMapsApi = YMapsApi & {
  Placemark: new (
    geometry: [number, number],
    properties: Record<string, string>,
    options: Record<string, unknown>,
  ) => unknown;
};
