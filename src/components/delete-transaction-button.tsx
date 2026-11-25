"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete transaction"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this transaction?")) return;
        startTransition(async () => {
          const res = await deleteTransaction(id);
          if (res.ok) toast.success("Deleted");
          else toast.error(res.error);
        });
      }}
    >
      <Trash2 className="text-muted-foreground" />
    </Button>
  );
}
