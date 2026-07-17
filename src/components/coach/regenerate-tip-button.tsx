"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { regenerateCoachTipAction } from "@/actions/coach.actions";
import { cn } from "@/lib/utils";

export function RegenerateTipButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await regenerateCoachTipAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Dica atualizada!");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-50"
    >
      <RefreshCw aria-hidden className={cn("size-3.5", isPending && "animate-spin")} />
      Atualizar dica
    </button>
  );
}
