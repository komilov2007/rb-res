export const PRIMARY_COLORS = [
  { id: "violet", label: "Binafsha", value: "oklch(0.56 0.196 283.44)" },
  { id: "blue", label: "Ko'k", value: "oklch(0.55 0.2 257)" },
  { id: "green", label: "Yashil", value: "oklch(0.6 0.15 155)" },
  { id: "orange", label: "To'q sariq", value: "oklch(0.66 0.19 45)" },
  { id: "red", label: "Qizil", value: "oklch(0.58 0.21 25)" },
  { id: "pink", label: "Pushti", value: "oklch(0.6 0.21 350)" },
] as const;

export type PrimaryColorId = (typeof PRIMARY_COLORS)[number]["id"];

export const DEFAULT_PRIMARY_COLOR: PrimaryColorId = "violet";

export const getPrimaryColorValue = (id: PrimaryColorId) =>
  (PRIMARY_COLORS.find((color) => color.id === id) ?? PRIMARY_COLORS[0]).value;

export const CLICK_PRIMARY_COLOR = "oklch(0.658 0.1888 250.51)";
