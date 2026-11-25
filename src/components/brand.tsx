import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-brand inline-flex size-9 items-center justify-center rounded-xl text-white shadow-md shadow-primary/30",
        className,
      )}
    >
      <Wallet className="size-[55%]" strokeWidth={2.2} />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">Pocket</span>
    </span>
  );
}
