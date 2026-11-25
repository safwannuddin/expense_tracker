import { Suspense } from "react";
import { getAccounts } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { ACCOUNT_TYPES, type Account } from "@/lib/types";
import { ACCOUNT_COLORS, ACCOUNT_ICONS, tint } from "@/lib/ui";
import { PageContainer, PageHeader } from "@/components/page-header";
import { AddAccountButton, ArchiveAccountButton } from "@/components/account-forms";
import { cn } from "@/lib/utils";

export default function AccountsPage() {
  return (
    <PageContainer>
      <PageHeader title="Accounts" subtitle="Your money" action={<AddAccountButton />} />
      <Suspense fallback={<Skeleton />}>
        <AccountsList />
      </Suspense>
    </PageContainer>
  );
}

async function AccountsList() {
  const accounts = await getAccounts({ includeArchived: true });
  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);
  const gbp = active.filter((a) => a.currency === "GBP");
  const assets = gbp.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const debts = gbp.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0);

  if (accounts.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="text-5xl">🏦</span>
        <p className="text-lg font-semibold">No accounts yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add each bank account, credit card or cash wallet with what&apos;s in it today.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Summary label="Net worth" value={formatMoney(assets + debts)} strong />
        <Summary label="You have" value={formatMoney(assets)} className="text-success" />
        <Summary label="You owe" value={formatMoney(Math.abs(debts))} className={debts < 0 ? "text-destructive" : undefined} />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((a) => (
          <AccountCard key={a.id} account={a} />
        ))}
      </ul>

      {archived.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-medium text-muted-foreground hover:text-foreground">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span> archived ({archived.length})
          </summary>
          <ul className="mt-3 grid gap-3 opacity-60 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((a) => (
              <AccountCard key={a.id} account={a} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function AccountCard({ account: a }: { account: Account }) {
  const Icon = ACCOUNT_ICONS[a.type];
  const color = ACCOUNT_COLORS[a.type];
  return (
    <li className="surface relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full" style={{ background: tint(color, 10) }} />
      <div className="relative flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl" style={{ background: tint(color, 16), color }}>
          <Icon className="size-5" />
        </span>
        <ArchiveAccountButton id={a.id} archived={a.archived} />
      </div>
      <p className="relative mt-4 font-medium">{a.name}</p>
      <p className="relative text-xs text-muted-foreground">{ACCOUNT_TYPES.find((t) => t.value === a.type)?.label}</p>
      <p className={cn("relative mt-3 text-2xl font-semibold tracking-tight tabular-nums", a.balance < 0 && "text-destructive")}>
        {formatMoney(a.balance, a.currency)}
      </p>
    </li>
  );
}

function Summary({ label, value, strong, className }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className={cn("surface p-4", strong && "bg-brand border-0 text-white")}>
      <p className={cn("text-xs", strong ? "text-white/75" : "text-muted-foreground")}>{label}</p>
      <p className={cn("mt-1 truncate font-semibold tabular-nums md:text-xl", className)}>{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
