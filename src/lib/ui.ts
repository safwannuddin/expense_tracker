import { Banknote, CreditCard, Landmark, PiggyBank, Wallet, type LucideIcon } from "lucide-react";
import type { AccountType } from "@/lib/types";

const CHART_VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"] as const;

/** Stable colour per category name, picked from the theme's chart palette. */
export function categoryColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `var(${CHART_VARS[h % CHART_VARS.length]})`;
}

export function chartColor(index: number): string {
  return `var(${CHART_VARS[index % CHART_VARS.length]})`;
}

/** Soft tinted background for an icon chip. */
export function tint(color: string, pct = 14): string {
  return `color-mix(in oklch, ${color} ${pct}%, transparent)`;
}

export const ACCOUNT_ICONS: Record<AccountType, LucideIcon> = {
  current: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
  cash: Banknote,
  other: Wallet,
};

export const ACCOUNT_COLORS: Record<AccountType, string> = {
  current: "var(--chart-1)",
  savings: "var(--chart-2)",
  credit: "var(--chart-4)",
  cash: "var(--chart-3)",
  other: "var(--chart-5)",
};
