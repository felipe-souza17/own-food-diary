import { MEAL_TYPES, MEAL_TYPE_CALORIE_WEIGHTS, type MealTypeValue } from "@/lib/constants";
import type { MealTypeConsumption } from "@/types";

export type PlanItemStatus = "registered" | "skipped" | "suggested";

export interface PlanItem {
  type: MealTypeValue;
  status: PlanItemStatus;
  /** kcal reais (registrada) ou sugeridos (a fazer). */
  calories: number;
}

export interface PlanResult {
  remaining: number;
  overGoal: number;
  items: PlanItem[];
}

const PLANNED_TYPES = MEAL_TYPES.filter((type) => MEAL_TYPE_CALORIE_WEIGHTS[type] > 0);

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Calcula o plano do dia: quanto ainda comer em cada refeição restante,
 * redistribuindo o orçamento (meta − consumido) por participação típica.
 * Refeições registradas saem do rateio; refeições "puladas" liberam seu peso
 * para as demais (é assim que pular o café aumenta o almoço).
 */
export function computeDayPlan(
  goal: number,
  consumed: number,
  byType: MealTypeConsumption[],
  skipped: MealTypeValue[] = [],
): PlanResult {
  const remaining = Math.max(0, goal - consumed);
  const overGoal = Math.max(0, consumed - goal);
  const skippedSet = new Set(skipped);
  const byTypeMap = new Map(byType.map((entry) => [entry.type, entry]));

  const activeTypes = PLANNED_TYPES.filter(
    (type) => !byTypeMap.get(type)?.registered && !skippedSet.has(type),
  );
  const sumWeights = activeTypes.reduce((sum, type) => sum + MEAL_TYPE_CALORIE_WEIGHTS[type], 0);

  const items: PlanItem[] = [];

  for (const type of MEAL_TYPES) {
    const entry = byTypeMap.get(type);
    const isPlanned = MEAL_TYPE_CALORIE_WEIGHTS[type] > 0;

    if (entry?.registered) {
      items.push({ type, status: "registered", calories: Math.round(entry.calories) });
      continue;
    }
    // "OUTRO" (não planejado) só aparece quando registrado.
    if (!isPlanned) continue;

    if (skippedSet.has(type)) {
      items.push({ type, status: "skipped", calories: 0 });
      continue;
    }

    const suggested =
      sumWeights > 0 ? roundTo((remaining * MEAL_TYPE_CALORIE_WEIGHTS[type]) / sumWeights, 10) : 0;
    items.push({ type, status: "suggested", calories: suggested });
  }

  return { remaining, overGoal, items };
}
