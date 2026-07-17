import "server-only";

import { createHash } from "node:crypto";

import { MEAL_TYPES, MEAL_TYPE_LABELS, type MealTypeValue } from "@/lib/constants";
import { computeDayPlan } from "@/lib/coach-core";
import { generateText, getGeminiModel, isGeminiEnabled } from "@/lib/gemini";
import { formatKcal } from "@/lib/nutrition-format";
import { dateStringToUTCDate, todayInputValue } from "@/lib/utils";
import { coachRepository } from "@/repositories/coach.repository";
import { mealRepository } from "@/repositories/meal.repository";
import { settingsService } from "@/services/settings.service";
import type { CoachTipResult, DaySnapshot, MealTypeConsumption } from "@/types";

async function getDaySnapshot(): Promise<DaySnapshot> {
  const dateKey = todayInputValue();
  const [meals, goal] = await Promise.all([
    mealRepository.findByDate(dateStringToUTCDate(dateKey)),
    settingsService.getCalorieGoal(),
  ]);

  const byType = new Map<MealTypeValue, MealTypeConsumption>(
    MEAL_TYPES.map((type) => [type, { type, registered: false, count: 0, calories: 0 }]),
  );

  for (const meal of meals) {
    const entry = byType.get(meal.mealType);
    if (!entry) continue;
    entry.registered = true;
    entry.count += 1;
    if (meal.nutrition?.status === "DONE" && meal.nutrition.calories !== null) {
      entry.calories += meal.nutrition.calories;
    }
  }

  const items = [...byType.values()].map((entry) => ({
    ...entry,
    calories: Math.round(entry.calories),
  }));
  const consumed = items.reduce((sum, entry) => sum + entry.calories, 0);

  return { dateKey, goal, consumed, byType: items };
}

function hashSnapshot(snapshot: DaySnapshot): string {
  const payload = JSON.stringify({
    goal: snapshot.goal,
    byType: snapshot.byType.map((entry) => [entry.type, entry.registered, entry.calories]),
  });
  return createHash("sha1").update(payload).digest("hex");
}

function buildTipPrompt(snapshot: DaySnapshot): string {
  const plan = computeDayPlan(
    snapshot.goal,
    snapshot.consumed,
    snapshot.byType as MealTypeConsumption[],
  );

  const registered = plan.items
    .filter((item) => item.status === "registered")
    .map((item) => `${MEAL_TYPE_LABELS[item.type]}: ${formatKcal(item.calories)}`);
  const pending = plan.items
    .filter((item) => item.status === "suggested")
    .map((item) => `${MEAL_TYPE_LABELS[item.type]}: ~${formatKcal(item.calories)}`);

  return [
    "Você é um assistente de nutrição amigável e prático. Escreva uma dica curta em português do Brasil",
    "(2 a 3 frases) para a pessoa distribuir o restante do dia. Tom encorajador, nunca de culpa.",
    "Não dê conselhos médicos nem fale em emagrecer/doenças; foque só na distribuição das calorias.",
    "Responda apenas com o texto da dica, sem títulos nem listas.",
    "",
    `Meta diária: ${snapshot.goal > 0 ? formatKcal(snapshot.goal) : "não definida"}.`,
    `Já consumido: ${formatKcal(snapshot.consumed)}.`,
    `Restante: ${formatKcal(plan.remaining)}${plan.overGoal > 0 ? ` (passou ${formatKcal(plan.overGoal)} da meta)` : ""}.`,
    registered.length ? `Refeições já feitas — ${registered.join("; ")}.` : "Nenhuma refeição registrada ainda hoje.",
    pending.length ? `Refeições restantes e sugestão de orçamento — ${pending.join("; ")}.` : "Todas as refeições do dia já foram registradas.",
  ].join("\n");
}

export const coachService = {
  async getTodayTip(force = false): Promise<CoachTipResult> {
    const snapshot = await getDaySnapshot();
    const aiEnabled = isGeminiEnabled();

    if (!aiEnabled || snapshot.goal <= 0) {
      return { tip: null, snapshot, aiEnabled };
    }

    const hash = hashSnapshot(snapshot);
    const date = dateStringToUTCDate(snapshot.dateKey);

    if (!force) {
      const existing = await coachRepository.findByDate(date);
      if (existing && existing.mealsHash === hash) {
        return { tip: existing.tip, snapshot, aiEnabled };
      }
    }

    try {
      const tip = await generateText(buildTipPrompt(snapshot));
      await coachRepository.upsert(date, { tip, mealsHash: hash, model: getGeminiModel() });
      return { tip, snapshot, aiEnabled };
    } catch (error) {
      console.error("[coach] Falha ao gerar dica:", error);
      return { tip: null, snapshot, aiEnabled };
    }
  },

  getSnapshot: getDaySnapshot,
};
