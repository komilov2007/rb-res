// Circular badge + glyph, built as an inline SVG data URI — there's no
// pre-made marker *image* asset in this project to reuse as a file, but the
// glyphs themselves are lucide-react's own path data (not hand-drawn):
// node_modules/lucide-react/dist/esm/icons/map-pin.mjs for a plain
// location, node_modules/lucide-react/dist/esm/icons/store.mjs for a branch,
// node_modules/lucide-react/dist/esm/icons/house.mjs for a customer address
// — this just fills the badge solid instead of tinted, since a map pin needs
// to read against terrain rather than a white card. "store"/"location" use
// --primary (branch pins); "customer" inverts it — white badge, --primary
// ring and glyph — so a delivery order's two-point route
// (src/components/delivery-route-sheet) reads as two distinct places at a
// glance, not "the same pin twice". Shared by
// src/components/branch-map-picker (multiple branches — "location" for the
// rest, "store" for the picked one), src/components/branch-info-sheet's own
// read-only single-branch map (always "store"), and delivery-route-sheet
// ("store" for the branch, "customer" for the delivery address).
const PRIMARY_PIN_COLOR = "oklch(0.56 0.196 283.44)";

const MAP_PIN_GLYPH = `
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
  <circle cx="12" cy="10" r="3" />
`;

const STORE_GLYPH = `
  <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
  <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
  <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
`;

const HOUSE_GLYPH = `
  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
  <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
`;

export type BranchPinVariant = "store" | "location" | "customer";

const GLYPHS: Record<BranchPinVariant, string> = {
  store: STORE_GLYPH,
  location: MAP_PIN_GLYPH,
  customer: HOUSE_GLYPH,
};

export const buildBranchPinHref = (
  variant: BranchPinVariant = "store",
  size = 40,
) => {
  const isCustomer = variant === "customer";
  const fill = isCustomer ? "#ffffff" : PRIMARY_PIN_COLOR;
  const accent = isCustomer ? PRIMARY_PIN_COLOR : "#ffffff";
  // A soft drop shadow (feDropShadow, not a CSS filter — this has to survive
  // being baked into the data URI itself) is what turns a flat colored
  // circle into something that reads as sitting "above" the map instead of
  // printed onto it flush.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
      <defs>
        <filter id="pin-shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-color="#000000" flood-opacity="0.32" />
        </filter>
      </defs>
      <circle cx="20" cy="20" r="17" fill="${fill}" stroke="${accent}" stroke-width="2.5" filter="url(#pin-shadow)" />
      <g transform="translate(10,10) scale(0.8333)" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        ${GLYPHS[variant]}
      </g>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
