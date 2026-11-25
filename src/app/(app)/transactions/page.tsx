import { Suspense } from "react";
import { connection } from "next/server";
import { getTransactions, summarise } from "@/lib/data";
import { currentMonth, isMonth, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { TransactionList } from "@/components/transaction-list";

export default function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Activity</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <MonthActivity searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MonthActivity({ searchParams }: { searchParams: PageProps<"/transactions">["searchParams"] }) {
  const { month: raw } = await searchParams;
  await connection(); // per-request: "this month" depends on today's date
  const now = currentMonth();
  const month = isMonth(raw) ? raw : now;
  const transactions = await getTransactions(month);
  const { income, spent } = summarise(transactions);

  return (
    <>
      <MonthSwitcher month={month} current={now} basePath="/transactions" />
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border bg-card py-3">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="text-lg font-semibold tabular-nums">{formatMoney(spent)}</p>
        </div>
        <div className="rounded-xl border bg-card py-3">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(income)}
          </p>
        </div>
      </div>
      {transactions.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nothing logged this month. Tap <strong>+</strong> to add your first expense.
        </p>
      ) : (
        <TransactionList transactions={transactions} today={todayISO()} allowDelete />
      )}
    </>
  );
}
