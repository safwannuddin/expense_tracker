import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { getAccounts, getTransactions, summarise } from "@/lib/data";
import { currentMonth, monthLabel, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { ACCOUNT_COLORS, ACCOUNT_ICONS, chartColor, tint } from "@/lib/ui";
import { PageContainer, PageHeader } from "@/components/page-header";
import { AddAccountButton } from "@/components/account-forms";
import { AddTransactionButton } from "@/components/add-transaction";
import { SpendingDonut, type Slice } from "@/components/spending-donut";
import { TransactionList } from "@/components/transaction-list";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <PageContainer>
      <Suspense fallback={<PageHeader title="Hello" subtitle="Overview" />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <Overview />
      </Suspense>
    </PageContainer>
  );
}

async function Greeting() {
  const user = await currentUser();
  await connection();
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }).format(new Date()),
  );
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <PageHeader
      subtitle={part}
      title={user?.firstName ?? "Welcome back"}
      action={<AddTransactionButton className="hidden sm:inline-flex md:hidden" />}
    />
  );
}

async function Overview() {
  await connection(); // per-request: "this month" depends on today's date
  const month = currentMonth();
  const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions(month)]);

  if (accounts.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span className="bg-brand flex size-16 items-center justify-center rounded-2xl text-3xl shadow-lg shadow-primary/30">
          🏦
        </span>
        <div className="space-y-1">
          <p className="text-lg font-semibold">Let&apos;s set up your money</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add each bank account, card or cash wallet with today&apos;s balance. Everything you log updates it automatically.
          </p>
        </div>
        <AddAccountButton />
      </div>
    );
  }

  const total = accounts.filter((a) => a.currency === "GBP").reduce((s, a) => s + a.balance, 0);
  const { income, spent, byCategory } = summarise(transactions);
  const net = income - spent;

  const top = byCategory.slice(0, 5);
  const rest = byCategory.slice(5).reduce((s, c) => s + c.amount, 0);
  const slices: Slice[] = top.map((c, i) => ({ ...c, color: chartColor(i) }));
  if (rest > 0) slices.push({ name: "Everything else", icon: "•", amount: rest, color: "var(--muted-foreground)" });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        {/* hero balance */}
        <section className="bg-brand relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-primary/25">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-10 size-44 rounded-full bg-white/5" />
          <p className="text-sm text-white/75">Total balance</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">{formatMoney(total)}</p>
          <p className="mt-1 text-xs text-white/60">
            {accounts.length} account{accounts.length === 1 ? "" : "s"} · {monthLabel(month)}
          </p>
          <div className="relative mt-6 grid grid-cols-2 gap-3">
            <HeroStat icon={ArrowDownLeft} label="Income" value={formatMoney(income)} />
            <HeroStat icon={ArrowUpRight} label="Spent" value={formatMoney(spent)} />
          </div>
        </section>

        {/* accounts strip */}
        <section className="space-y-3">
          <SectionTitle title="Accounts" href="/accounts" />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {accounts.map((a) => {
              const Icon = ACCOUNT_ICONS[a.type];
              const color = ACCOUNT_COLORS[a.type];
              return (
                <Link key={a.id} href="/accounts" className="surface w-40 shrink-0 p-4 transition hover:-translate-y-0.5 md:w-auto">
                  <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: tint(color), color }}>
                    <Icon className="size-[18px]" />
                  </span>
                  <p className="mt-3 truncate text-sm text-muted-foreground">{a.name}</p>
                  <p className={cn("font-semibold tabular-nums", a.balance < 0 && "text-destructive")}>
                    {formatMoney(a.balance, a.currency)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* recent */}
        <section className="space-y-3">
          <SectionTitle title="Recent activity" href="/transactions" />
          {transactions.length === 0 ? (
            <div className="surface px-6 py-10 text-center text-sm text-muted-foreground">
              Nothing logged in {monthLabel(month)} yet. Tap <span className="font-semibold text-primary">+</span> to add your first expense.
            </div>
          ) : (
            <TransactionList transactions={transactions.slice(0, 6)} today={todayISO()} />
          )}
        </section>
      </div>

      <div className="space-y-6 lg:col-span-2">
        {/* net this month */}
        <section className="surface flex items-center gap-4 p-5">
          <span
            className="flex size-11 items-center justify-center rounded-xl"
            style={{ background: tint(net >= 0 ? "var(--success)" : "var(--destructive)"), color: net >= 0 ? "var(--success)" : "var(--destructive)" }}
          >
            {net >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Net this month</p>
            <p className={cn("text-xl font-semibold tabular-nums", net >= 0 ? "text-success" : "text-destructive")}>
              {net >= 0 ? "+" : "−"}
              {formatMoney(Math.abs(net))}
            </p>
          </div>
        </section>

        {/* spending breakdown */}
        <section className="surface space-y-5 p-5">
          <div>
            <h2 className="font-semibold">Where your money went</h2>
            <p className="text-sm text-muted-foreground">{monthLabel(month)}</p>
          </div>
          {slices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No spending yet this month.</p>
          ) : (
            <>
              <SpendingDonut slices={slices} total={spent} />
              <ul className="space-y-3">
                {slices.map((s) => (
                  <li key={s.name} className="flex items-center gap-3 text-sm">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 truncate">
                      {s.icon} {s.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{Math.round((s.amount / spent) * 100)}%</span>
                    <span className="w-20 text-right font-medium tabular-nums">{formatMoney(s.amount)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: typeof ArrowUpRight; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/12 px-3 py-2.5 backdrop-blur">
      <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-white/70">{label}</p>
        <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      <Link href={href} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
        See all <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div className="h-52 animate-pulse rounded-3xl bg-muted" />
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
    </div>
  );
}
