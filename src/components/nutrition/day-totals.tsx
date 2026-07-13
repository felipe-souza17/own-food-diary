import { Droplets } from "lucide-react";

import { NUTRITION_MACRO_LABELS, NUTRITION_MACROS, WATER_DAILY_GOAL_ML } from "@/lib/constants";
import { formatGrams, formatKcal, formatWater } from "@/lib/nutrition-format";
import type { DayTotals as DayTotalsType } from "@/types";

/** Barra de totais de um dia: kcal + macros + água (com progresso). */
export function DayTotals({ totals }: { totals: DayTotalsType }) {
  const hasNutrition = totals.calories > 0;
  const hasWater = totals.waterMl > 0;

  if (!hasNutrition && !hasWater && totals.uncountedMeals === 0) return null;

  const waterPercent = Math.min(100, Math.round((totals.waterMl / WATER_DAILY_GOAL_ML) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        {hasNutrition && (
          <>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">
              ≈ {formatKcal(totals.calories)}
            </span>
            {NUTRITION_MACROS.map((macro) => (
              <span key={macro} className="text-zinc-500">
                <span className="font-medium text-zinc-600">{NUTRITION_MACRO_LABELS[macro]}</span>{" "}
                {formatGrams(totals[macro])}
              </span>
            ))}
          </>
        )}

        {totals.uncountedMeals > 0 && (
          <span className="text-zinc-400">
            {totals.uncountedMeals}{" "}
            {totals.uncountedMeals === 1 ? "refeição sem cálculo" : "refeições sem cálculo"}
          </span>
        )}
      </div>

      {hasWater && (
        <div className="flex items-center gap-2">
          <Droplets aria-hidden className="size-3.5 shrink-0 text-sky-500" />
          <div
            className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100"
            role="progressbar"
            aria-valuenow={waterPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${waterPercent}%` }} />
          </div>
          <span className="text-xs text-sky-600">
            {formatWater(totals.waterMl)}
            <span className="text-zinc-400"> / {formatWater(WATER_DAILY_GOAL_ML)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
