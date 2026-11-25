import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { BottomNav } from "@/components/bottom-nav";
import { AddTransaction } from "@/components/add-transaction";
import { getAccounts, getCategories } from "@/lib/data";
import { todayISO } from "@/lib/dates";

// Shell for every signed-in page: content + bottom nav with the big "+" button.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <RequireUser>
        <div className="flex flex-1 flex-col pb-24">{children}</div>
        <BottomNav
          addButton={
            <Suspense fallback={<div className="-mt-6 size-14 rounded-full bg-muted" />}>
              <AddButton />
            </Suspense>
          }
        />
      </RequireUser>
    </Suspense>
  );
}

async function RequireUser({ children }: { children: React.ReactNode }) {
  await auth.protect(); // redirects to sign-in when signed out
  return <>{children}</>;
}

async function AddButton() {
  await connection(); // per-request: default date is today
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);
  return <AddTransaction accounts={accounts} categories={categories} today={todayISO()} />;
}
