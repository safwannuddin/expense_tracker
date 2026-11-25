import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, shiftMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MonthSwitcher({ month, current, basePath }: { month: string; current: string; basePath: string }) {
  const atLatest = month >= current;
  const btn = "flex size-9 items-center justify-center rounded-full transition hover:bg-muted";
  return (
    <div className="surface inline-flex items-center gap-1 rounded-full p-1">
      <Link href={`${basePath}?month=${shiftMonth(month, -1)}`} className={btn} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Link>
      <span className="min-w-32 text-center text-sm font-medium">{monthLabel(month)}</span>
      {atLatest ? (
        <span className={cn(btn, "opacity-30")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link href={`${basePath}?month=${shiftMonth(month, 1)}`} className={btn} aria-label="Next month">
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
