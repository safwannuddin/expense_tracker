"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { toMinor } from "@/lib/money";

export type ActionResult = { ok: true } | { ok: false; error: string };

function zodError(e: z.ZodError): ActionResult {
  return { ok: false, error: e.issues[0]?.message ?? "Invalid input" };
}

// ---------- accounts ----------

const AccountInput = z.object({
  name: z.string().trim().min(1, "Give the account a name").max(60),
  type: z.enum(["current", "savings", "credit", "cash", "other"]),
  openingBalance: z.coerce.number({ message: "Enter a starting balance" }).finite(),
  currency: z.string().length(3).default("GBP"),
});

export async function createAccount(input: z.input<typeof AccountInput>): Promise<ActionResult> {
  const parsed = AccountInput.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const { name, type, openingBalance, currency } = parsed.data;

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("accounts").insert({
    name,
    type,
    currency: currency.toUpperCase(),
    opening_balance: toMinor(openingBalance),
  });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function setAccountArchived(id: string, archived: boolean): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Bad account id" };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("accounts").update({ archived }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

// ---------- transactions ----------

const TxInput = z
  .object({
    type: z.enum(["expense", "income", "transfer"]),
    amount: z.coerce.number({ message: "Enter an amount" }).positive("Amount must be more than 0"),
    accountId: z.uuid("Pick an account"),
    toAccountId: z.uuid().optional().or(z.literal("")),
    categoryId: z.uuid().optional().or(z.literal("")),
    occurredAt: z.iso.date("Pick a date"),
    note: z.string().trim().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "transfer") {
      if (!v.toAccountId) ctx.addIssue({ code: "custom", message: "Pick the account to move money to" });
      else if (v.toAccountId === v.accountId)
        ctx.addIssue({ code: "custom", message: "Pick two different accounts" });
    }
  });

export async function createTransaction(input: z.input<typeof TxInput>): Promise<ActionResult> {
  const parsed = TxInput.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const v = parsed.data;

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("transactions").insert({
    type: v.type,
    amount: toMinor(v.amount),
    account_id: v.accountId,
    transfer_account_id: v.type === "transfer" ? v.toAccountId : null,
    category_id: v.type === "transfer" ? null : v.categoryId || null,
    occurred_at: v.occurredAt,
    note: v.note || null,
    created_via: "manual",
  });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Bad transaction id" };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}
