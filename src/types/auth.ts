export type AuthProps = {
  customer: number;
  phone: string;
  access: string;
  refresh: string;
  firstname: string;
};

export type LoginPayloadProps = {
  phone: string;
  platform: "WEBSITE";
  shop: string;
};

export type SignupPayloadProps = {
  firstname: string;
};
