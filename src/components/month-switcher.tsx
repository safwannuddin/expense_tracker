import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, shiftMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MonthSwitcher({ month, current, basePath }: { month: string; current: string; basePath: string }) {
  const next = shiftMonth(month, 1);
  const atLatest = month >= current;
  const btn = "flex size-9 items-center justify-center rounded-full hover:bg-muted";
  return (
    <div className="flex items-center justify-between">
      <Link href={`${basePath}?month=${shiftMonth(month, -1)}`} className={btn} aria-label="Previous month">
        <ChevronLeft className="size-5" />
      </Link>
      <span className="font-medium">{monthLabel(month)}</span>
      {atLatest ? (
        <span className={cn(btn, "opacity-30")} aria-hidden>
          <ChevronRight className="size-5" />
        </span>
      ) : (
        <Link href={`${basePath}?month=${next}`} className={btn} aria-label="Next month">
          <ChevronRight className="size-5" />
        </Link>
      )}
    </div>
  );
}
