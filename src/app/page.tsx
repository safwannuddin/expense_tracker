import Link from "next/link";
import { Button } from "@/components/ui/button";

// Static landing page. Signed-in users are redirected to /dashboard in proxy.ts.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Pocket</h1>
      <p className="max-w-sm text-muted-foreground">
        Track every pound across your accounts, see where your money went this
        month, and plan what to save for next.
      </p>
      <div className="flex gap-3">
        <Button nativeButton={false} render={<Link href="/sign-up" />}>
          Get started
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/sign-in" />}
        >
          Sign in
        </Button>
      </div>
    </main>
  );
}
