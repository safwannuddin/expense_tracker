// All money is stored as integer minor units (pence) to avoid float rounding bugs.

export const DEFAULT_CURRENCY = "GBP";

export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

export function formatMoney(minor: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    fromMinor(minor),
  );
}
