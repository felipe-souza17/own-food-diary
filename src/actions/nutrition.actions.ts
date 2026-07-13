"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { mealRepository } from "@/repositories/meal.repository";
import { nutritionService } from "@/services/nutrition.service";
import { nutritionManualSchema, type NutritionManualValues } from "@/validators/nutrition.schema";
import type { ActionResult } from "@/types";

function revalidateMealViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/refeicoes");
  revalidatePath("/share/[token]", "page");
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === "Não autorizado.") {
    return "Sessão expirada. Faça login novamente.";
  }
  console.error("[nutrition.actions]", error);
  return fallback;
}

/** Recalcula a nutrição de uma refeição via IA (ignora ajuste manual). */
export async function recalculateNutritionAction(
  mealId: string,
): Promise<ActionResult<{ status: string }>> {
  try {
    await requireAdmin();

    if (!z.string().uuid().safeParse(mealId).success) {
      return { ok: false, error: "Refeição inválida." };
    }
    if (!nutritionService.isEnabled()) {
      return { ok: false, error: "Análise nutricional indisponível (GEMINI_API_KEY ausente)." };
    }

    const meal = await mealRepository.findById(mealId);
    if (!meal) {
      return { ok: false, error: "Refeição não encontrada." };
    }

    const result = await nutritionService.analyzeAndSave(meal, { force: true });
    revalidateMealViews();

    if (result.status === "FAILED") {
      return { ok: false, error: "A IA não conseguiu analisar esta refeição. Tente novamente." };
    }

    return { ok: true, data: { status: result.status } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível recalcular a nutrição.") };
  }
}

/** Salva um ajuste manual dos totais nutricionais (não recalculado). */
export async function saveManualNutritionAction(
  mealId: string,
  values: NutritionManualValues,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!z.string().uuid().safeParse(mealId).success) {
      return { ok: false, error: "Refeição inválida." };
    }

    const parsed = nutritionManualSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Valores inválidos." };
    }

    await nutritionService.saveManual(mealId, parsed.data);
    revalidateMealViews();

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível salvar o ajuste.") };
  }
}

/** Processa em lote as refeições ainda sem nutrição (pendentes/falhas). */
export async function processPendingNutritionAction(): Promise<ActionResult<{ processed: number }>> {
  try {
    await requireAdmin();

    if (!nutritionService.isEnabled()) {
      return { ok: false, error: "Análise nutricional indisponível (GEMINI_API_KEY ausente)." };
    }

    const { processed } = await nutritionService.processPending(12);
    revalidateMealViews();

    return { ok: true, data: { processed } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível processar as pendentes.") };
  }
}
