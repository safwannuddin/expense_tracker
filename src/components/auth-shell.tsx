import Link from "next/link";
import { Logo } from "@/components/brand";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-40 -z-10 h-[420px] w-full max-w-3xl rounded-full bg-primary/15 blur-3xl" />
      <Link href="/">
        <Logo />
      </Link>
      {children}
    </main>
  );
}
