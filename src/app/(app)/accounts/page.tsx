import { Suspense } from "react";
import { getAccounts } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { ACCOUNT_TYPES } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { AddAccountButton, ArchiveAccountButton } from "@/components/account-forms";
import { cn } from "@/lib/utils";

export default function AccountsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <AddAccountButton />
      </header>
      <Suspense fallback={<Skeleton />}>
        <AccountsList />
      </Suspense>
    </main>
  );
}

async function AccountsList() {
  const accounts = await getAccounts({ includeArchived: true });
  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);
  const total = active.filter((a) => a.currency === "GBP").reduce((s, a) => s + a.balance, 0);

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-2 py-8 text-center">
          <p className="text-4xl">🏦</p>
          <p className="font-medium">No accounts yet</p>
          <p className="text-sm text-muted-foreground">
            Add each bank account, card or cash wallet with its current balance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Total across accounts</p>
          <p className={cn("text-3xl font-semibold", total < 0 && "text-destructive")}>{formatMoney(total)}</p>
        </CardContent>
      </Card>

      <ul className="space-y-2">
        {active.map((a) => (
          <AccountRow key={a.id} account={a} />
        ))}
      </ul>

      {archived.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Archived ({archived.length})</summary>
          <ul className="mt-2 space-y-2 opacity-60">
            {archived.map((a) => (
              <AccountRow key={a.id} account={a} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function AccountRow({ account: a }: { account: Awaited<ReturnType<typeof getAccounts>>[number] }) {
  return (
    <li className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
      <div>
        <p className="font-medium">{a.name}</p>
        <p className="text-xs text-muted-foreground">
          {ACCOUNT_TYPES.find((t) => t.value === a.type)?.label ?? a.type}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-semibold tabular-nums", a.balance < 0 && "text-destructive")}>
          {formatMoney(a.balance, a.currency)}
        </span>
        <ArchiveAccountButton id={a.id} archived={a.archived} />
      </div>
    </li>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
