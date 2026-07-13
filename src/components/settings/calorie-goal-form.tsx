"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateCalorieGoalAction } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CalorieGoalForm({ initialGoal }: { initialGoal: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(initialGoal));
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(value);

    startTransition(async () => {
      const result = await updateCalorieGoalAction(parsed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setValue(String(result.data.calorieGoalKcal));
      toast.success("Meta atualizada!");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label htmlFor="calorieGoal" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Meta diária (kcal)
          </label>
          <Input
            id="calorieGoal"
            type="number"
            min="0"
            max="20000"
            step="50"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isPending}
          />
        </div>
        <Button type="submit" isLoading={isPending}>
          Salvar meta
        </Button>
      </div>
      <p className="text-xs text-zinc-500">
        Usada como linha de referência no gráfico de calorias. Defina 0 para desativar a linha de
        meta.
      </p>
    </form>
  );
}
