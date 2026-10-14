import type {
  AtmosphereCategoryProps,
  AtmosphereImageProps,
  AtmosphereProps,
} from "@/types/atmosphere";

export type AtmosphereSection = {
  key: string;
  title: string | null;
  cover: string | null;
  photos: string[];
  offset: number;
};

const toSources = (images: AtmosphereImageProps[]) =>
  images.map((item) => item.image).filter(Boolean);

const getCategoryPhotos = (category: AtmosphereCategoryProps) => {
  const photos = toSources(category.images);

  if (photos.length > 0) return photos;

  return category.image ? [category.image] : [];
};

export const getAtmosphereMedia = (atmosphere: AtmosphereProps) => {
  const groups = [
    { key: "general", title: null, cover: null, photos: toSources(atmosphere.images) },
    ...atmosphere.categories.map((category) => ({
      key: `category-${category.id}`,
      title: category.name,
      cover: category.image || null,
      photos: getCategoryPhotos(category),
    })),
  ].filter((group) => group.photos.length > 0);

  const video = atmosphere.video || null;
  let cursor = video ? 1 : 0;

  const sections: AtmosphereSection[] = groups.map((group) => {
    const section = { ...group, offset: cursor };

    cursor += group.photos.length;

    return section;
  });

  const media = [
    ...(video ? [video] : []),
    ...sections.flatMap((section) => section.photos),
  ];

  return {
    video,
    cover: video ? null : (media[0] ?? null),
    sections,
    media,
  };
};

export const getAtmosphereCover = (atmosphere?: AtmosphereProps) => {
  if (!atmosphere) return null;

  return getAtmosphereMedia(atmosphere).sections[0]?.photos[0] ?? null;
};

export type AtmosphereMedia = ReturnType<typeof getAtmosphereMedia>;
