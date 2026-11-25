import { ArrowLeftRight } from "lucide-react";
import { dayLabel } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Transaction } from "@/lib/types";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { cn } from "@/lib/utils";

export function TransactionList({
  transactions,
  today,
  allowDelete = false,
}: {
  transactions: Transaction[];
  today: string;
  allowDelete?: boolean;
}) {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const g = groups.get(t.occurred_at) ?? [];
    g.push(t);
    groups.set(t.occurred_at, g);
  }

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([date, items]) => (
        <section key={date}>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {dayLabel(date, today)}
          </h3>
          <ul className="divide-y rounded-xl border bg-card">
            {items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                  {t.type === "transfer" ? <ArrowLeftRight className="size-4" /> : (t.category?.icon ?? "❔")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {t.note || (t.type === "transfer" ? "Transfer" : (t.category?.name ?? "Uncategorised"))}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.type === "transfer"
                      ? `${t.account?.name} → ${t.to_account?.name}`
                      : `${t.category?.name ?? "Uncategorised"} · ${t.account?.name}`}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    t.type === "income" && "text-emerald-600 dark:text-emerald-400",
                    t.type === "transfer" && "text-muted-foreground",
                  )}
                >
                  {t.type === "expense" ? "−" : t.type === "income" ? "+" : ""}
                  {formatMoney(t.amount, t.account?.currency)}
                </span>
                {allowDelete && <DeleteTransactionButton id={t.id} />}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
