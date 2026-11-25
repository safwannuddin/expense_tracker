"use client";

import { Cell, Pie, PieChart } from "recharts";
import { formatMoney } from "@/lib/money";

export interface Slice {
  name: string;
  icon: string | null;
  amount: number;
  color: string;
}

export function SpendingDonut({ slices, total }: { slices: Slice[]; total: number }) {
  return (
    <div className="relative mx-auto size-44 shrink-0">
      <PieChart width={176} height={176}>
        <Pie
          data={slices}
          dataKey="amount"
          nameKey="name"
          innerRadius={62}
          outerRadius={84}
          paddingAngle={slices.length > 1 ? 3 : 0}
          cornerRadius={6}
          stroke="none"
          isAnimationActive={false}
        >
          {slices.map((s) => (
            <Cell key={s.name} fill={s.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Spent</span>
        <span className="text-lg font-semibold tabular-nums">{formatMoney(total)}</span>
      </div>
    </div>
  );
}
