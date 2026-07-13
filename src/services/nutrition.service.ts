import "server-only";

import { Prisma, type Meal } from "@prisma/client";

import { generateJson, getGeminiModel, isGeminiEnabled } from "@/lib/gemini";
import { nutritionRepository } from "@/repositories/nutrition.repository";
import {
  geminiResponseSchema,
  type NutritionManualValues,
} from "@/validators/nutrition.schema";
import type { NutritionItem, NutritionTotals } from "@/types";

const EMPTY_TOTALS: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Soma os itens em totais arredondados (o total sempre bate com os itens). */
export function sumItems(items: NutritionItem[]): NutritionTotals {
  const totals = items.reduce<NutritionTotals>(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + item.fiber,
    }),
    { ...EMPTY_TOTALS },
  );

  return {
    calories: round(totals.calories),
    protein: round(totals.protein),
    carbs: round(totals.carbs),
    fat: round(totals.fat),
    fiber: round(totals.fiber),
  };
}

function buildPrompt(description: string): string {
  return [
    "Você é um nutricionista especialista. Analise a descrição de UMA refeição, em português do Brasil.",
    "A descrição normalmente contém as quantidades pesadas em gramas (ex.: \"150g de arroz, 120g de frango grelhado\").",
    "",
    "Para cada alimento, estime os valores nutricionais para a QUANTIDADE informada (não por 100g),",
    "baseando-se em tabelas de composição de alimentos — priorize a TACO (brasileira); use a USDA quando faltar.",
    "",
    "Regras:",
    "- calories em kcal; protein, carbs, fat e fiber em gramas; gramas = quantidade do item (0 se não informada).",
    "- Não invente alimentos que não estejam na descrição.",
    "- Se NÃO houver quantidades/pesagens, ou for uma refeição livre / sem detalhes para estimar,",
    "  retorne freeMeal=true e items vazio.",
    "",
    `Descrição: ${description}`,
  ].join("\n");
}

export interface AnalysisResult {
  status: "DONE" | "FREE_MEAL" | "FAILED";
  totals: NutritionTotals | null;
  items: NutritionItem[];
}

/**
 * Analisa a refeição com o Gemini e persiste o resultado em MealNutrition.
 * Não lança: em erro, grava status FAILED. Refeições marcadas como manuais
 * não são recalculadas.
 */
export const nutritionService = {
  isEnabled: isGeminiEnabled,

  async analyzeAndSave(
    meal: Pick<Meal, "id" | "description">,
    options: { force?: boolean } = {},
  ): Promise<AnalysisResult> {
    if (!isGeminiEnabled()) {
      return { status: "FAILED", totals: null, items: [] };
    }

    if (!options.force) {
      const existing = await nutritionRepository.findByMealId(meal.id);
      if (existing?.isManual) {
        return {
          status: existing.status === "FREE_MEAL" ? "FREE_MEAL" : "DONE",
          totals: null,
          items: [],
        };
      }
    }

    try {
      const raw = await generateJson(buildPrompt(meal.description));
      const parsed = geminiResponseSchema.parse(JSON.parse(raw));

      if (parsed.freeMeal || parsed.items.length === 0) {
        await nutritionRepository.upsert(meal.id, {
          status: "FREE_MEAL",
          calories: null,
          protein: null,
          carbs: null,
          fat: null,
          fiber: null,
          items: Prisma.JsonNull,
          isManual: false,
          model: getGeminiModel(),
          analyzedAt: new Date(),
        });
        return { status: "FREE_MEAL", totals: null, items: [] };
      }

      const totals = sumItems(parsed.items);
      await nutritionRepository.upsert(meal.id, {
        status: "DONE",
        ...totals,
        items: parsed.items as unknown as Prisma.InputJsonValue,
        isManual: false,
        model: getGeminiModel(),
        analyzedAt: new Date(),
      });

      return { status: "DONE", totals, items: parsed.items };
    } catch (error) {
      console.error("[nutrition] Falha ao analisar refeição:", error);
      await nutritionRepository
        .upsert(meal.id, { status: "FAILED", analyzedAt: new Date() })
        .catch(() => undefined);
      return { status: "FAILED", totals: null, items: [] };
    }
  },

  /** Salva um ajuste manual dos totais (não será recalculado). */
  async saveManual(mealId: string, values: NutritionManualValues): Promise<void> {
    await nutritionRepository.upsert(mealId, {
      status: "DONE",
      ...values,
      isManual: true,
      analyzedAt: new Date(),
    });
  },

  /**
   * Processa em lote as refeições pendentes/falhas. O lote é pequeno para caber
   * no tempo da função serverless e no rate limit gratuito (15 req/min) —
   * basta clicar novamente para continuar o backfill.
   */
  async processPending(limit: number, delayMs = 0): Promise<{ processed: number }> {
    if (!isGeminiEnabled()) return { processed: 0 };

    const { prisma } = await import("@/lib/prisma");
    const ids = await nutritionRepository.findMealIdsToProcess(limit);
    let processed = 0;

    for (const id of ids) {
      const meal = await prisma.meal.findUnique({
        where: { id },
        select: { id: true, description: true },
      });
      if (!meal) continue;

      await this.analyzeAndSave(meal);
      processed++;

      if (delayMs > 0 && processed < ids.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return { processed };
  },
};
