// Booking page layout variants, picked by whoever renders <Booking />
// (page.tsx). They share one form (usePage + schema); only the UI differs.
export type BookingVariant = "one" | "two";

// Guest count bounds — the schema and both variants' steppers share them.
export const BOOKING_MIN_GUESTS = 1;
export const BOOKING_MAX_GUESTS = 999;
