import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { AppNav } from "@/components/app-nav";
import { AddTransactionProvider } from "@/components/add-transaction";
import { getAccounts, getCategories } from "@/lib/data";
import { todayISO } from "@/lib/dates";

// Shell for every signed-in page: sidebar (desktop) / bottom bar (phone) + add-transaction sheet.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  await auth.protect(); // redirects to sign-in when signed out
  await connection(); // per-request: default date is today
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);

  return (
    <AddTransactionProvider accounts={accounts} categories={categories} today={todayISO()}>
      <AppNav />
      <div className="flex flex-1 flex-col pb-32 md:pb-10 md:pl-64">{children}</div>
    </AddTransactionProvider>
  );
}
