export type AccountType = "current" | "savings" | "credit" | "cash" | "other";
export type TxType = "expense" | "income" | "transfer";

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "current", label: "Current account" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit card" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  archived: boolean;
  opening_balance: number;
  balance: number; // pence
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  kind: "expense" | "income";
  monthly_budget: number | null;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number; // pence, always positive
  note: string | null;
  occurred_at: string;
  account_id: string;
  transfer_account_id: string | null;
  account: { name: string; currency: string } | null;
  to_account: { name: string } | null;
  category: { name: string; icon: string | null } | null;
}
