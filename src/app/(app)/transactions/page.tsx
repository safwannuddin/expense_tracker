import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { getTransactions, summarise } from "@/lib/data";
import { currentMonth, isMonth, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { tint } from "@/lib/ui";
import { PageContainer, PageHeader } from "@/components/page-header";
import { MonthSwitcher } from "@/components/month-switcher";
import { TransactionList } from "@/components/transaction-list";
import { cn } from "@/lib/utils";

export default function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  return (
    <PageContainer>
      <PageHeader title="Activity" subtitle="Every pound in and out" />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
        <MonthActivity searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}

async function MonthActivity({ searchParams }: { searchParams: PageProps<"/transactions">["searchParams"] }) {
  const { month: raw } = await searchParams;
  await connection(); // per-request: "this month" depends on today's date
  const now = currentMonth();
  const month = isMonth(raw) ? raw : now;
  const transactions = await getTransactions(month);
  const { income, spent } = summarise(transactions);
  const net = income - spent;

  return (
    <div className="space-y-6">
      <MonthSwitcher month={month} current={now} basePath="/transactions" />

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={ArrowUpRight} label="Spent" value={formatMoney(spent)} color="var(--destructive)" />
        <Stat icon={ArrowDownLeft} label="Income" value={formatMoney(income)} color="var(--success)" />
        <Stat
          icon={Scale}
          label="Net"
          value={`${net < 0 ? "−" : "+"}${formatMoney(Math.abs(net))}`}
          color={net < 0 ? "var(--destructive)" : "var(--success)"}
          valueClass={net < 0 ? "text-destructive" : "text-success"}
        />
      </div>

      {transactions.length === 0 ? (
        <div className="surface px-6 py-14 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-medium">Nothing logged this month</p>
          <p className="text-sm text-muted-foreground">Tap + to add your first expense.</p>
        </div>
      ) : (
        <TransactionList transactions={transactions} today={todayISO()} allowDelete showDayTotals />
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
  valueClass,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
  color: string;
  valueClass?: string;
}) {
  return (
    <div className="surface p-4">
      <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: tint(color), color }}>
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className={cn("truncate font-semibold tabular-nums md:text-lg", valueClass)}>{value}</p>
    </div>
  );
}
