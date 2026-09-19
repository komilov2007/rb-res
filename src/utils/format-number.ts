export const formatPhone = (value: string) => {
  const first = value.slice(0, 2);
  const second = value.slice(2, 5);
  const third = value.slice(5, 7);
  const fourth = value.slice(7, 9);

  return [first, second, third, fourth].filter(Boolean).join(" ");
};

export const getDigits = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D/g, "");

  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
};

// "+998901234567" / "998901234567" -> "901234567" — the local-number shape
// the firstname-update endpoint expects.
export const getLocalPhone = (phone?: string | null) =>
  phone?.replace(/^\+?998/, "") ?? "";
