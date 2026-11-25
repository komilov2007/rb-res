// GET robomarket/click/superapp/{shop} — verified against the live response
// (slug comes back as null for shops without a click.robosell.uz page).
export type OfertaProps = {
  address: string;
  bank_account: string;
  is_natural: boolean;
  mfo: string;
  name: string;
  phone: string;
  slug: string | null;
  tin_or_pinfl: string;
};
