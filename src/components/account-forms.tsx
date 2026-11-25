"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Plus } from "lucide-react";
import { toast } from "sonner";
import { createAccount, setAccountArchived } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/types";

export function AddAccountButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAccount({
        name: f.get("name") as string,
        type: f.get("type") as AccountType,
        openingBalance: f.get("openingBalance") as string,
        currency: "GBP",
      });
      if (res.ok) {
        toast.success("Account added");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className="h-10 gap-1.5 rounded-xl px-4">
        <Plus /> Add account
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
            <DialogDescription>
              Enter what&apos;s in the account today. Everything you log after this updates the balance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Monzo, Barclays, Cash" required maxLength={60} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <NativeSelect id="type" name="type" defaultValue="current">
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openingBalance">Current balance (£)</Label>
                <Input
                  id="openingBalance"
                  name="openingBalance"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Credit card? Enter what you owe as a negative number, e.g. -250.
            </p>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Add account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ArchiveAccountButton({ id, archived }: { id: string; archived: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={archived ? "Restore account" : "Archive account"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await setAccountArchived(id, !archived);
          if (res.ok) toast.success(archived ? "Account restored" : "Account archived");
          else toast.error(res.error);
        })
      }
    >
      {archived ? <ArchiveRestore /> : <Archive />}
    </Button>
  );
}
