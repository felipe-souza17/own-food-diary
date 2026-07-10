"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { mealService } from "@/services/meal.service";
import { blobService } from "@/services/blob.service";
import { mealFormSchema, type MealFormValues } from "@/validators/meal.schema";
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
  console.error("[meal.actions]", error);
  return fallback;
}

export async function createMealAction(
  values: MealFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = mealFormSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
    }

    const meal = await mealService.create(parsed.data);
    revalidateMealViews();

    return { ok: true, data: { id: meal.id } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível criar a refeição.") };
  }
}

export async function updateMealAction(
  id: string,
  values: MealFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!z.string().uuid().safeParse(id).success) {
      return { ok: false, error: "Refeição inválida." };
    }

    const parsed = mealFormSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
    }

    const meal = await mealService.update(id, parsed.data);
    revalidateMealViews();

    return { ok: true, data: { id: meal.id } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível atualizar a refeição.") };
  }
}

export async function deleteMealAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!z.string().uuid().safeParse(id).success) {
      return { ok: false, error: "Refeição inválida." };
    }

    await mealService.delete(id);
    revalidateMealViews();

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível excluir a refeição.") };
  }
}

export async function deleteUploadedImageAction(url: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!z.string().url().safeParse(url).success) {
      return { ok: false, error: "URL inválida." };
    }

    await blobService.deleteByUrls([url]);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível remover a imagem.") };
  }
}
