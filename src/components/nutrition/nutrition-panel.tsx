"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  recalculateNutritionAction,
  saveManualNutritionAction,
} from "@/actions/nutrition.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NUTRITION_MACRO_LABELS, NUTRITION_MACROS } from "@/lib/constants";
import { formatGrams, formatKcal } from "@/lib/nutrition-format";
import { nutritionManualSchema, type NutritionManualValues } from "@/validators/nutrition.schema";
import type { MealNutrition, NutritionItem } from "@/types";

interface NutritionPanelProps {
  mealId: string;
  nutrition: MealNutrition | null;
  aiEnabled: boolean;
}

export function NutritionPanel({ mealId, nutrition, aiEnabled }: NutritionPanelProps) {
  const router = useRouter();
  const [isRecalculating, startRecalc] = useTransition();
  const [editing, setEditing] = useState(false);

  const items = (nutrition?.items as NutritionItem[] | null) ?? [];
  const hasValues = nutrition?.status === "DONE" && nutrition.calories !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NutritionManualValues>({
    resolver: zodResolver(nutritionManualSchema),
    defaultValues: {
      calories: nutrition?.calories ?? 0,
      protein: nutrition?.protein ?? 0,
      carbs: nutrition?.carbs ?? 0,
      fat: nutrition?.fat ?? 0,
      fiber: nutrition?.fiber ?? 0,
    },
  });

  function handleRecalculate() {
    startRecalc(async () => {
      const result = await recalculateNutritionAction(mealId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.data.status === "FREE_MEAL"
          ? "Marcada como refeição livre."
          : "Nutrição recalculada!",
      );
      router.refresh();
    });
  }

  function onManualSubmit(values: NutritionManualValues) {
    saveManualNutritionAction(mealId, values).then((result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Ajuste manual salvo.");
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles aria-hidden className="size-4 text-emerald-600" />
          Nutrição
        </CardTitle>
        {aiEnabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            isLoading={isRecalculating}
          >
            {!isRecalculating && <RefreshCw aria-hidden className="size-4" />}
            Recalcular com IA
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!aiEnabled && !hasValues && (
          <p className="text-sm text-zinc-500">
            Cálculo automático desativado (defina <code>GEMINI_API_KEY</code>). Você ainda pode
            ajustar os valores manualmente.
          </p>
        )}

        {nutrition?.status === "FREE_MEAL" && !editing && (
          <p className="text-sm text-zinc-500">Marcada como refeição livre (sem estimativa).</p>
        )}

        {hasValues && !editing && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                {nutrition?.isManual ? "" : "≈ "}
                {formatKcal(nutrition!.calories!)}
              </span>
              {NUTRITION_MACROS.map((macro) => (
                <span
                  key={macro}
                  className="rounded-lg bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600"
                >
                  <span className="font-medium text-zinc-700">{NUTRITION_MACRO_LABELS[macro]}</span>{" "}
                  {formatGrams(nutrition![macro] ?? 0)}
                </span>
              ))}
            </div>

            {items.length > 0 && (
              <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-100 text-sm">
                {items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between px-3 py-2">
                    <span className="text-zinc-700">
                      {item.nome}
                      {item.gramas ? (
                        <span className="text-zinc-400"> · {formatGrams(item.gramas)}</span>
                      ) : null}
                    </span>
                    <span className="text-zinc-500">{formatKcal(item.calories)}</span>
                  </li>
                ))}
              </ul>
            )}

            {nutrition?.isManual && (
              <p className="text-xs text-zinc-400">Valores ajustados manualmente.</p>
            )}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <FormField label="Calorias (kcal)" htmlFor="calories" error={errors.calories?.message}>
                <Input id="calories" type="number" step="1" min="0" {...register("calories")} />
              </FormField>
              {NUTRITION_MACROS.map((macro) => (
                <FormField
                  key={macro}
                  label={`${NUTRITION_MACRO_LABELS[macro]} (g)`}
                  htmlFor={macro}
                  error={errors[macro]?.message}
                >
                  <Input id={macro} type="number" step="0.1" min="0" {...register(macro)} />
                </FormField>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Salvar ajuste
              </Button>
            </div>
          </form>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil aria-hidden className="size-4" />
            Ajustar manualmente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
