"use client";

import { createContext, useContext, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { createTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/native-select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { categoryColor, tint } from "@/lib/ui";
import type { Account, Category, TxType } from "@/lib/types";

// ---------- context: any button in the app can open the sheet ----------

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useAddTransaction = () => useContext(Ctx);

export function AddTransactionProvider({
  accounts,
  categories,
  today,
  children,
}: {
  accounts: Account[];
  categories: Category[];
  today: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-6 md:rounded-3xl md:border"
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted md:hidden" />
          <SheetHeader className="pb-0">
            <SheetTitle className="text-lg">New transaction</SheetTitle>
            <SheetDescription>Log spending, income or a move between accounts.</SheetDescription>
          </SheetHeader>
          {open && (
            <TransactionForm accounts={accounts} categories={categories} today={today} onDone={() => setOpen(false)} />
          )}
        </SheetContent>
      </Sheet>
    </Ctx.Provider>
  );
}

export function AddTransactionFab() {
  const { open } = useAddTransaction();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Add transaction"
      className="bg-brand flex size-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/40 transition hover:brightness-110 active:scale-95"
    >
      <Plus className="size-7" strokeWidth={2.4} />
    </button>
  );
}

export function AddTransactionButton({ className }: { className?: string }) {
  const { open } = useAddTransaction();
  return (
    <Button onClick={open} className={cn("bg-brand h-11 gap-2 rounded-xl border-0 text-white shadow-md shadow-primary/30 hover:brightness-110", className)}>
      <Plus className="size-5" /> Add transaction
    </Button>
  );
}

// ---------- the form ----------

const TYPES: { value: TxType; label: string; icon: typeof ArrowUpRight; color: string }[] = [
  { value: "expense", label: "Expense", icon: ArrowUpRight, color: "var(--destructive)" },
  { value: "income", label: "Income", icon: ArrowDownLeft, color: "var(--success)" },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight, color: "var(--primary)" },
];

function TransactionForm({
  accounts,
  categories,
  today,
  onDone,
}: {
  accounts: Account[];
  categories: Category[];
  today: string;
  onDone: () => void;
}) {
  const [type, setType] = useState<TxType>("expense");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [pending, startTransition] = useTransition();

  if (accounts.length === 0) {
    return (
      <div className="space-y-4 px-4 pb-2 text-sm">
        <p className="text-muted-foreground">Add a bank account first, then you can log spending against it.</p>
        <Button nativeButton={false} className="w-full" render={<Link href="/accounts" onClick={onDone} />}>
          Add an account
        </Button>
      </div>
    );
  }

  const cats = categories.filter((c) => c.kind === (type === "income" ? "income" : "expense"));
  const selectedCat = cats.some((c) => c.id === categoryId) ? categoryId : "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (type !== "transfer" && !selectedCat) {
      toast.error("Pick a category");
      return;
    }
    startTransition(async () => {
      const res = await createTransaction({
        type,
        amount: f.get("amount") as string,
        accountId,
        toAccountId: type === "transfer" ? toAccountId : "",
        categoryId: type === "transfer" ? "" : selectedCat,
        occurredAt: f.get("occurredAt") as string,
        note: (f.get("note") as string) ?? "",
      });
      if (res.ok) {
        toast.success(`${TYPES.find((t) => t.value === type)!.label} saved`);
        onDone();
      } else {
        toast.error(res.error);
      }
    });
  }

  const active = TYPES.find((t) => t.value === type)!;

  return (
    <form onSubmit={onSubmit} className="space-y-5 px-4 pb-2">
      {/* type */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-muted p-1.5">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition",
              type === t.value ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
            style={type === t.value ? { color: t.color } : undefined}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* amount */}
      <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-center focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <Label htmlFor="amount" className="justify-center text-xs uppercase tracking-wider text-muted-foreground">
          Amount
        </Label>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="text-3xl font-semibold" style={{ color: active.color }}>£</span>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            autoFocus
            className="w-40 bg-transparent text-center text-4xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* accounts */}
      <div className="space-y-2">
        <Label>{type === "transfer" ? "From" : "Account"}</Label>
        <ChipRow>
          {accounts.map((a) => (
            <Chip key={a.id} selected={accountId === a.id} onClick={() => setAccountId(a.id)}>
              {a.name}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {type === "transfer" ? (
        <div className="space-y-2">
          <Label htmlFor="toAccountId">To</Label>
          <NativeSelect id="toAccountId" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="rounded-xl">
            <option value="" disabled>Choose account…</option>
            {accounts.filter((a) => a.id !== accountId).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </NativeSelect>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {cats.map((c) => {
              const color = categoryColor(c.name);
              const sel = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] leading-tight transition",
                    sel ? "border-primary bg-secondary font-medium" : "border-transparent hover:bg-muted",
                  )}
                >
                  <span className="flex size-9 items-center justify-center rounded-full text-lg" style={{ background: tint(color, 18) }}>
                    {c.icon}
                  </span>
                  <span className="line-clamp-2 text-center">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="occurredAt">Date</Label>
          <Input id="occurredAt" name="occurredAt" type="date" defaultValue={today} max={today} required className="h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Input id="note" name="note" placeholder="Optional" maxLength={200} className="h-10 rounded-xl" />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="bg-brand h-12 w-full rounded-xl border-0 text-base text-white shadow-md shadow-primary/30 hover:brightness-110">
        {pending ? "Saving…" : `Save ${active.label.toLowerCase()}`}
      </Button>
    </form>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">{children}</div>;
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
        selected ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
