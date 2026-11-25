"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, ListOrdered, Wallet } from "lucide-react";
import { Logo } from "@/components/brand";
import { AddTransactionButton, AddTransactionFab } from "@/components/add-transaction";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Overview", short: "Home", icon: Home },
  { href: "/transactions", label: "Activity", short: "Activity", icon: ListOrdered },
  { href: "/accounts", label: "Accounts", short: "Accounts", icon: Wallet },
];

/** Sidebar on desktop, floating bottom bar on phones. */
export function AppNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar px-4 py-6 md:flex">
        <Link href="/dashboard" className="px-2">
          <Logo />
        </Link>
        <AddTransactionButton className="mt-8 w-full" />
        <nav className="mt-6 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive(l.href)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <l.icon className="size-[18px]" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-xl border px-3 py-2.5">
          <UserButton />
          <span className="text-sm text-muted-foreground">Your account</span>
        </div>
      </aside>

      {/* mobile bottom bar */}
      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden">
        <div className="mx-auto flex max-w-md items-center rounded-3xl border bg-card/90 px-2 py-1.5 shadow-xl shadow-black/5 backdrop-blur-xl">
          {LINKS.slice(0, 2).map((l) => (
            <MobileLink key={l.href} {...l} active={isActive(l.href)} />
          ))}
          <div className="flex flex-1 justify-center">
            <AddTransactionFab />
          </div>
          <MobileLink {...LINKS[2]} active={isActive(LINKS[2].href)} />
          <div className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] text-muted-foreground">
            <UserButton />
            Me
          </div>
        </div>
      </nav>
    </>
  );
}

function MobileLink({
  href,
  short,
  icon: Icon,
  active,
}: (typeof LINKS)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
      {short}
    </Link>
  );
}
