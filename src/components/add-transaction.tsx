"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/native-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Account, Category, TxType } from "@/lib/types";

const TYPES: { value: TxType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

export function AddTransaction({
  accounts,
  categories,
  today,
}: {
  accounts: Account[];
  categories: Category[];
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TxType>("expense");
  const [pending, startTransition] = useTransition();

  const cats = categories.filter((c) => c.kind === (type === "income" ? "income" : "expense"));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    startTransition(async () => {
      const res = await createTransaction({
        type,
        amount: f.get("amount") as string,
        accountId: f.get("accountId") as string,
        toAccountId: (f.get("toAccountId") as string) ?? "",
        categoryId: (f.get("categoryId") as string) ?? "",
        occurredAt: f.get("occurredAt") as string,
        note: (f.get("note") as string) ?? "",
      });
      if (res.ok) {
        toast.success(type === "transfer" ? "Transfer saved" : `${TYPES.find((t) => t.value === type)!.label} saved`);
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition active:scale-95"
      >
        <Plus className="size-7" />
      </button>

      <SheetContent side="bottom" className="mx-auto max-h-[92dvh] max-w-2xl overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>Add transaction</SheetTitle>
        </SheetHeader>

        {accounts.length === 0 ? (
          <div className="space-y-3 px-4 pb-4 text-sm">
            <p className="text-muted-foreground">Add a bank account first, then you can log spending against it.</p>
            <Button nativeButton={false} render={<Link href="/accounts" onClick={() => setOpen(false)} />}>
              Add an account
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 px-4 pb-4">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "rounded-md py-1.5 text-sm font-medium transition",
                    type === t.value ? "bg-background shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (£)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                autoFocus
                className="h-12 text-2xl font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="accountId">{type === "transfer" ? "From" : "Account"}</Label>
                <NativeSelect id="accountId" name="accountId" required defaultValue={accounts[0]?.id}>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </NativeSelect>
              </div>

              {type === "transfer" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="toAccountId">To</Label>
                  <NativeSelect id="toAccountId" name="toAccountId" required defaultValue={accounts[1]?.id ?? ""}>
                    <option value="" disabled>Choose…</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </NativeSelect>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId">Category</Label>
                  <NativeSelect key={type} id="categoryId" name="categoryId" defaultValue={cats[0]?.id}>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </NativeSelect>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="occurredAt">Date</Label>
                <Input id="occurredAt" name="occurredAt" type="date" defaultValue={today} max={today} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Note</Label>
                <Input id="note" name="note" placeholder="e.g. Bus to uni" maxLength={200} />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
