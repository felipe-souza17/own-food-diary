import { Sparkles, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatGrams, formatKcal } from "@/lib/nutrition-format";
import { cn } from "@/lib/utils";
import type { MealNutrition } from "@/types";

const MACROS = [
  { key: "protein", short: "P" },
  { key: "carbs", short: "C" },
  { key: "fat", short: "G" },
  { key: "fiber", short: "F" },
] as const;

interface NutritionBadgeProps {
  nutrition: MealNutrition | null;
  /** Mostra um marcador discreto quando não há cálculo (só no admin). */
  showEmpty?: boolean;
  className?: string;
}

/** Exibe kcal + macros estimados de uma refeição (ou "refeição livre"). */
export function NutritionBadge({ nutrition, showEmpty = false, className }: NutritionBadgeProps) {
  if (nutrition?.status === "FREE_MEAL") {
    return <Badge className={cn("bg-zinc-100 text-zinc-500 ring-zinc-400/20", className)}>Refeição livre</Badge>;
  }

  if (nutrition?.status === "DONE" && nutrition.calories !== null) {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <Sparkles aria-hidden className="size-3" />
          {nutrition.isManual ? "" : "≈ "}
          {formatKcal(nutrition.calories)}
        </span>
        <span className="text-xs text-zinc-500">
          {MACROS.map(({ key, short }, index) => (
            <span key={key}>
              {index > 0 && <span className="mx-1 text-zinc-300">·</span>}
              <span className="font-medium text-zinc-600">{short}</span> {formatGrams(nutrition[key] ?? 0)}
            </span>
          ))}
        </span>
      </div>
    );
  }

  if (showEmpty) {
    const isFailed = nutrition?.status === "FAILED";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          isFailed ? "font-medium text-amber-600" : "text-zinc-400",
          className,
        )}
      >
        {isFailed && <TriangleAlert aria-hidden className="size-3.5" />}
        {isFailed ? "Não foi possível calcular" : "Sem cálculo"}
      </span>
    );
  }

  return null;
}
