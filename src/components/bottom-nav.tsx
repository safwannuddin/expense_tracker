"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Activity", icon: ListOrdered },
  { href: "/accounts", label: "Accounts", icon: Wallet },
];

export function BottomNav({ addButton }: { addButton: React.ReactNode }) {
  const pathname = usePathname();
  const [first, ...rest] = LINKS;

  const item = (l: (typeof LINKS)[number]) => {
    const active = pathname.startsWith(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <l.icon className="size-5" />
        {l.label}
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center">
        {item(first)}
        {item(rest[0])}
        <div className="flex flex-1 justify-center">{addButton}</div>
        {item(rest[1])}
      </div>
    </nav>
  );
}
