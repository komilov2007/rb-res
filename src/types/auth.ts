export type AuthProps = {
  customer: number;
  phone: string;
  access: string;
  refresh: string;
  firstname: string;
  // true until the user accepts the public offer (POST click/update/oferta)
  is_new?: boolean;
};

export type LoginPayloadProps = {
  phone: string;
  platform: "WEBSITE";
  shop: string;
};

export type SignupPayloadProps = {
  firstname: string;
  phone: string;
};

export type UpdateFirstnameResponse = {
  firstname: string;
};

// GET privacy-policy?login_type=… — live response only carries uz/ru keys.
type PolicyLocale = "uz" | "ru" | "en" | "tr";

export type PrivacyPolicyProps = Partial<
  Record<`user_policy_${"website" | "telegram"}_${PolicyLocale}`, string>
>;
