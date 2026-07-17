"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, SkipForward, Utensils } from "lucide-react";

import { computeDayPlan } from "@/lib/coach-core";
import { MEAL_TYPE_LABELS, type MealTypeValue } from "@/lib/constants";
import { formatKcal } from "@/lib/nutrition-format";
import type { MealTypeConsumption } from "@/types";

interface DayPlanProps {
  goal: number;
  consumed: number;
  byType: MealTypeConsumption[];
}

export function DayPlan({ goal, consumed, byType }: DayPlanProps) {
  const [skipped, setSkipped] = useState<MealTypeValue[]>([]);

  const plan = useMemo(
    () => computeDayPlan(goal, consumed, byType, skipped),
    [goal, consumed, byType, skipped],
  );

  function toggleSkip(type: MealTypeValue) {
    setSkipped((current) =>
      current.includes(type) ? current.filter((entry) => entry !== type) : [...current, type],
    );
  }

  if (goal <= 0) {
    return (
      <p className="text-sm text-zinc-500">
        Defina uma <span className="font-medium text-zinc-700">meta calórica</span> em Configurações
        para ver o plano do dia.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        {plan.overGoal > 0 ? (
          <>
            <span className="text-2xl font-bold text-red-600">{formatKcal(plan.overGoal)}</span>
            <span className="text-sm text-zinc-500">acima da meta hoje</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold text-emerald-600">{formatKcal(plan.remaining)}</span>
            <span className="text-sm text-zinc-500">restantes para a meta</span>
          </>
        )}
      </div>

      <ul className="space-y-1.5">
        {plan.items.map((item) => {
          const label = MEAL_TYPE_LABELS[item.type];

          if (item.status === "registered") {
            return (
              <li
                key={item.type}
                className="flex items-center justify-between rounded-lg bg-emerald-50/60 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-zinc-700">
                  <Check aria-hidden className="size-4 text-emerald-600" />
                  {label}
                </span>
                <span className="font-medium text-emerald-700">{formatKcal(item.calories)}</span>
              </li>
            );
          }

          if (item.status === "skipped") {
            return (
              <li
                key={item.type}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-zinc-400 line-through">
                  <SkipForward aria-hidden className="size-4" />
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSkip(item.type)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800"
                >
                  <RotateCcw className="size-3" />
                  Desfazer
                </button>
              </li>
            );
          }

          return (
            <li
              key={item.type}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-zinc-700">
                <Utensils aria-hidden className="size-4 text-zinc-400" />
                {label}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-medium text-zinc-900">
                  {item.calories > 0 ? `~ ${formatKcal(item.calories)}` : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSkip(item.type)}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-700"
                >
                  Pular
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-zinc-400">
        As sugestões redistribuem o restante do dia entre as refeições que faltam. Marque como{" "}
        <span className="font-medium">pular</span> as que você não vai fazer.
      </p>
    </div>
  );
}
