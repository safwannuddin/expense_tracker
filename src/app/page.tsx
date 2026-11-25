import Link from "next/link";
import { ArrowRight, PieChart, ShieldCheck, Smartphone, Sparkles, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand";

const FEATURES = [
  { icon: Wallet, title: "All your accounts", text: "Banks, cards and cash in one place with live balances." },
  { icon: PieChart, title: "See where it goes", text: "Monthly breakdown by category, at a glance." },
  { icon: Target, title: "Plan ahead", text: "Know what to set aside for bills and goals." },
  { icon: Sparkles, title: "AI quick-add", text: "Type “20 bus monzo” and it fills in the rest." },
  { icon: Smartphone, title: "On your phone", text: "Install it to your home screen like a native app." },
  { icon: ShieldCheck, title: "Private by design", text: "Your data is locked to your account at database level." },
];

// Static landing page. Signed-in users are redirected to /dashboard in proxy.ts.
export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[480px] max-w-4xl rounded-full bg-primary/15 blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Logo />
        <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
          Sign in
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-16 pt-10 text-center md:px-8 md:pt-20">
        <span className="surface inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" /> Personal finance, simplified
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          Know exactly where{" "}
          <span className="bg-brand bg-clip-text text-transparent">every pound</span> goes.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground text-balance md:text-lg">
          Track spending across all your accounts, see your month at a glance, and plan what to save for what&apos;s next.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="bg-brand h-12 gap-2 rounded-xl border-0 px-6 text-base text-white shadow-lg shadow-primary/30 hover:brightness-110"
          >
            Get started free <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/sign-in" />} className="h-12 rounded-xl px-6 text-base">
            I have an account
          </Button>
        </div>

        <div className="mt-20 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">Pocket · Built for one, ready for friends.</footer>
    </div>
  );
}
