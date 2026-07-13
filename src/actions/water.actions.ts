"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { dailyLogService } from "@/services/daily-log.service";
import type { ActionResult } from "@/types";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === "Não autorizado.") {
    return "Sessão expirada. Faça login novamente.";
  }
  console.error("[water.actions]", error);
  return fallback;
}

/** Ajusta a água do dia por um delta (ex.: +200ml, -200ml). */
export async function addWaterAction(
  dateString: string,
  deltaMl: number,
): Promise<ActionResult<{ waterMl: number }>> {
  try {
    await requireAdmin();

    if (!dateSchema.safeParse(dateString).success) {
      return { ok: false, error: "Data inválida." };
    }
    if (!Number.isFinite(deltaMl) || Math.abs(deltaMl) > 20000) {
      return { ok: false, error: "Quantidade inválida." };
    }

    const waterMl = await dailyLogService.addWater(dateString, deltaMl);
    revalidatePath("/admin");
    revalidatePath("/share/[token]", "page");

    return { ok: true, data: { waterMl } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível atualizar a água.") };
  }
}

/** Define o valor absoluto de água do dia. */
export async function setWaterAction(
  dateString: string,
  ml: number,
): Promise<ActionResult<{ waterMl: number }>> {
  try {
    await requireAdmin();

    if (!dateSchema.safeParse(dateString).success) {
      return { ok: false, error: "Data inválida." };
    }
    if (!Number.isFinite(ml) || ml < 0 || ml > 20000) {
      return { ok: false, error: "Quantidade inválida." };
    }

    const waterMl = await dailyLogService.setWater(dateString, ml);
    revalidatePath("/admin");
    revalidatePath("/share/[token]", "page");

    return { ok: true, data: { waterMl } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível atualizar a água.") };
  }
}
