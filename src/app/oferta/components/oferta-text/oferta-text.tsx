import type { LocaleProps } from "@/types/i18n";
import type { OfertaProps } from "@/types/oferta";

import { EN } from "./en";
import { RU } from "./ru";
import { UZ } from "./uz";

// Legal text ported verbatim from the old webapp (uz/ru/en only);
// tr has no translation there, so it falls back to en.
const TEXT_BY_LOCALE: Record<LocaleProps, (props: OfertaProps) => React.JSX.Element> = {
  uz: UZ,
  ru: RU,
  en: EN,
  tr: EN,
};

type OfertaTextProps = {
  locale: LocaleProps;
  data: OfertaProps;
};

export const OfertaText = ({ locale, data }: OfertaTextProps) => {
  const Text = TEXT_BY_LOCALE[locale] ?? UZ;

  return <Text {...data} />;
};
