// "Powered by" brand per platform (general.login_type) — from rb-webapp
// constants/login-type.ts. Unknown values fall back to Robosell.
export const POWERED_BY = {
  bitomarket: { value: "Bitomarket.uz", url: "https://bitomarket.uz/" },
  era: { value: "ERA.uz", url: "https://hub.era.uz/" },
  plummarket: { value: "Plummarket.uz", url: "https://plummarket.uz/" },
  robosell: { value: "Robosell.uz", url: "https://robosell.uz/" },
} as const;

export const getPoweredBy = (loginType?: string | null) =>
  POWERED_BY[(loginType ?? "robosell") as keyof typeof POWERED_BY] ??
  POWERED_BY.robosell;
