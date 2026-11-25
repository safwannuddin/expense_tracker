import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { getAccounts, getTransactions, summarise } from "@/lib/data";
import { currentMonth, monthLabel, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddAccountButton } from "@/components/account-forms";
import { TransactionList } from "@/components/transaction-list";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <header className="flex items-center justify-between">
        <Suspense fallback={<h1 className="text-2xl font-semibold">Hi</h1>}>
          <Greeting />
        </Suspense>
        <UserButton />
      </header>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-muted" />}>
        <Overview />
      </Suspense>
    </main>
  );
}

async function Greeting() {
  const user = await currentUser();
  return <h1 className="text-2xl font-semibold">Hi{user?.firstName ? `, ${user.firstName}` : ""}</h1>;
}

async function Overview() {
  await connection(); // per-request: "this month" depends on today's date
  const month = currentMonth();
  const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions(month)]);

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-4xl">👋</p>
          <p className="font-medium">Let&apos;s set up your money</p>
          <p className="text-sm text-muted-foreground">
            Start by adding your bank accounts with their current balances.
          </p>
          <AddAccountButton />
        </CardContent>
      </Card>
    );
  }

  const total = accounts.filter((a) => a.currency === "GBP").reduce((s, a) => s + a.balance, 0);
  const { income, spent, byCategory } = summarise(transactions);
  const net = income - spent;
  const top = byCategory[0]?.amount ?? 0;

  return (
    <>
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="space-y-1 py-5">
          <p className="text-sm opacity-80">Total balance</p>
          <p className="text-4xl font-semibold tabular-nums">{formatMoney(total)}</p>
          <p className="text-xs opacity-70">
            across {accounts.length} account{accounts.length === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Spent" value={formatMoney(spent)} />
        <Stat label="Income" value={formatMoney(income)} className="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Net" value={formatMoney(net)} className={net < 0 ? "text-destructive" : undefined} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending in {monthLabel(month)}</CardTitle>
        </CardHeader>
        <CardContent>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No spending yet this month. Tap + to log one.</p>
          ) : (
            <ul className="space-y-3">
              {byCategory.slice(0, 6).map((c) => (
                <li key={c.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {c.icon} {c.name}
                    </span>
                    <span className="tabular-nums">{formatMoney(c.amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(c.amount / top) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent</h2>
            <Link href="/transactions" className="text-sm text-muted-foreground hover:underline">
              See all
            </Link>
          </div>
          <TransactionList transactions={transactions.slice(0, 5)} today={todayISO()} />
        </section>
      )}
    </>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border bg-card py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-base font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}
