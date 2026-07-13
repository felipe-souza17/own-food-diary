"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { processPendingNutritionAction } from "@/actions/nutrition.actions";
import { Button } from "@/components/ui/button";

/** Dispara a análise nutricional das refeições ainda sem cálculo. */
export function ProcessPendingButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await processPendingNutritionAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.data.processed > 0
          ? `${result.data.processed} refeição(ões) analisada(s).`
          : "Nenhuma refeição pendente.",
      );
      router.refresh();
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} isLoading={isPending}>
      {!isPending && <Sparkles aria-hidden className="size-4" />}
      Analisar pendentes
    </Button>
  );
}
