import { ArrowLeftRight } from "lucide-react";
import { dayLabel } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Transaction } from "@/lib/types";
import { categoryColor, tint } from "@/lib/ui";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { cn } from "@/lib/utils";

export function TransactionList({
  transactions,
  today,
  allowDelete = false,
  showDayTotals = false,
}: {
  transactions: Transaction[];
  today: string;
  allowDelete?: boolean;
  showDayTotals?: boolean;
}) {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const g = groups.get(t.occurred_at) ?? [];
    g.push(t);
    groups.set(t.occurred_at, g);
  }

  return (
    <div className="space-y-5">
      {[...groups.entries()].map(([date, items]) => {
        const daySpent = items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        return (
          <section key={date}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dayLabel(date, today)}
              </h3>
              {showDayTotals && daySpent > 0 && (
                <span className="text-xs tabular-nums text-muted-foreground">−{formatMoney(daySpent)}</span>
              )}
            </div>
            <ul className="surface divide-y overflow-hidden">
              {items.map((t) => (
                <TransactionRow key={t.id} t={t} allowDelete={allowDelete} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function TransactionRow({ t, allowDelete }: { t: Transaction; allowDelete: boolean }) {
  const isTransfer = t.type === "transfer";
  const color = isTransfer ? "var(--primary)" : categoryColor(t.category?.name ?? "Uncategorised");
  const title = t.note || (isTransfer ? "Transfer" : (t.category?.name ?? "Uncategorised"));
  const subtitle = isTransfer
    ? `${t.account?.name} → ${t.to_account?.name}`
    : `${t.category?.name ?? "Uncategorised"} · ${t.account?.name}`;

  return (
    <li className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/40">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ background: tint(color, 16), color }}
      >
        {isTransfer ? <ArrowLeftRight className="size-[18px]" /> : (t.category?.icon ?? "❔")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          t.type === "income" && "text-success",
          isTransfer && "text-muted-foreground",
        )}
      >
        {t.type === "expense" ? "−" : t.type === "income" ? "+" : ""}
        {formatMoney(t.amount, t.account?.currency)}
      </span>
      {allowDelete && (
        <span className="md:opacity-0 md:transition md:group-hover:opacity-100">
          <DeleteTransactionButton id={t.id} />
        </span>
      )}
    </li>
  );
}
