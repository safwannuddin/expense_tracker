import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { monthRange } from "@/lib/dates";
import type { Account, Category, Transaction } from "@/lib/types";

const DEFAULT_CATEGORIES: Pick<Category, "name" | "icon" | "kind">[] = [
  { name: "Groceries", icon: "🛒", kind: "expense" },
  { name: "Transport", icon: "🚌", kind: "expense" },
  { name: "Eating out", icon: "🍔", kind: "expense" },
  { name: "Rent", icon: "🏠", kind: "expense" },
  { name: "Bills", icon: "💡", kind: "expense" },
  { name: "Phone & internet", icon: "📱", kind: "expense" },
  { name: "Shopping", icon: "🛍️", kind: "expense" },
  { name: "Entertainment", icon: "🎬", kind: "expense" },
  { name: "Health", icon: "💊", kind: "expense" },
  { name: "Education", icon: "📚", kind: "expense" },
  { name: "Travel", icon: "✈️", kind: "expense" },
  { name: "Gifts", icon: "🎁", kind: "expense" },
  { name: "Other", icon: "📦", kind: "expense" },
  { name: "Salary", icon: "💼", kind: "income" },
  { name: "Student finance", icon: "🎓", kind: "income" },
  { name: "Freelance", icon: "💸", kind: "income" },
  { name: "Refund", icon: "↩️", kind: "income" },
  { name: "Other income", icon: "💰", kind: "income" },
];

const TX_SELECT = `
  id, type, amount, note, occurred_at, account_id, transfer_account_id,
  account:accounts!transactions_account_id_fkey(name, currency),
  to_account:accounts!transactions_transfer_account_id_fkey(name),
  category:categories(name, icon)
`;

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not load ${what}: ${error.message}`);
}

export async function getAccounts({ includeArchived = false } = {}): Promise<Account[]> {
  const supabase = await createServerSupabase();
  let q = supabase.from("account_balances").select("*").order("name");
  if (!includeArchived) q = q.eq("archived", false);
  const { data, error } = await q;
  if (error) fail("accounts", error);
  return data as Account[];
}

/** Returns the user's categories, creating a sensible default set on first use. */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabase();
  const load = () =>
    supabase.from("categories").select("id, name, icon, kind, monthly_budget").order("name");

  let { data, error } = await load();
  if (error) fail("categories", error);
  if (data && data.length === 0) {
    const ins = await supabase
      .from("categories")
      .upsert(DEFAULT_CATEGORIES, { onConflict: "user_id,name,kind", ignoreDuplicates: true });
    if (ins.error) fail("default categories", ins.error);
    ({ data, error } = await load());
    if (error) fail("categories", error);
  }
  return data as Category[];
}

export async function getTransactions(month: string, limit?: number): Promise<Transaction[]> {
  const supabase = await createServerSupabase();
  const { start, end } = monthRange(month);
  let q = supabase
    .from("transactions")
    .select(TX_SELECT)
    .gte("occurred_at", start)
    .lt("occurred_at", end)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) fail("transactions", error);
  return data as unknown as Transaction[];
}

export interface MonthSummary {
  income: number;
  spent: number;
  byCategory: { name: string; icon: string | null; amount: number }[];
}

export function summarise(transactions: Transaction[]): MonthSummary {
  let income = 0;
  let spent = 0;
  const cats = new Map<string, { name: string; icon: string | null; amount: number }>();
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") {
      spent += t.amount;
      const name = t.category?.name ?? "Uncategorised";
      const c = cats.get(name) ?? { name, icon: t.category?.icon ?? "❔", amount: 0 };
      c.amount += t.amount;
      cats.set(name, c);
    }
  }
  return {
    income,
    spent,
    byCategory: [...cats.values()].sort((a, b) => b.amount - a.amount),
  };
}
