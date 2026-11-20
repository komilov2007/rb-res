// TODO(atmosphere-mock): VAQTINCHA statik ma'lumot. Atmosfera API ishlaganda
// hooks/useAtmosphere.ts dagi ATMOSPHERE_MOCK ni false qilib, bu faylni o'chiring.
// Rasmlar: public/atmosfer/1.jpg ... 10.jpg

import type { AtmosphereImageProps, AtmosphereProps } from "@/types/atmosphere";

const photos = (...numbers: number[]): AtmosphereImageProps[] =>
  numbers.map((number) => ({ id: number, image: `/atmosfer/${number}.jpg` }));

export const ATMOSPHERE_MOCK_DATA: AtmosphereProps = {
  title: null,
  desc: "Iliq yorug'lik, shinam zallar va samimiy xizmat — oilaviy kechki ovqat, do'stlar davrasi yoki muhim uchrashuv uchun o'z stolingizni oldindan band qiling.",
  video: null,
  images: [],
  categories: [
    { id: 1, name: "Asosiy zal", image: null, images: photos(1, 3, 5, 8) },
    { id: 2, name: "Bar va oshxona", image: null, images: photos(4, 6, 10) },
    { id: 3, name: "Kechki muhit", image: null, images: photos(2, 9) },
    { id: 4, name: "Oilaviy xona", image: null, images: photos(7) },
  ],
};
