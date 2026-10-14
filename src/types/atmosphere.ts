export type AtmosphereImageProps = {
  id: number;
  image: string;
};

export type AtmosphereCategoryProps = {
  id: number;
  name: string;
  image: string | null;
  images: AtmosphereImageProps[];
};

export type AtmosphereProps = {
  title: string | null;
  desc: string | null;
  video: string | null;
  categories: AtmosphereCategoryProps[];
  images: AtmosphereImageProps[];
};
