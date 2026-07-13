"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { CALORIE_GOAL_MAX } from "@/lib/constants";
import { settingsService } from "@/services/settings.service";
import type { ActionResult } from "@/types";

const calorieGoalSchema = z.coerce.number().int().min(0).max(CALORIE_GOAL_MAX);

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === "Não autorizado.") {
    return "Sessão expirada. Faça login novamente.";
  }
  console.error("[settings.actions]", error);
  return fallback;
}

/** Define a meta/limite diário de calorias (0 desativa a linha de meta). */
export async function updateCalorieGoalAction(
  value: number,
): Promise<ActionResult<{ calorieGoalKcal: number }>> {
  try {
    await requireAdmin();

    const parsed = calorieGoalSchema.safeParse(value);
    if (!parsed.success) {
      return { ok: false, error: "Informe um valor entre 0 e 20000." };
    }

    const calorieGoalKcal = await settingsService.setCalorieGoal(parsed.data);
    revalidatePath("/admin");
    revalidatePath("/admin/configuracoes");
    revalidatePath("/share/[token]", "page");

    return { ok: true, data: { calorieGoalKcal } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível salvar a meta.") };
  }
}
