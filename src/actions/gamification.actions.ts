"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-guard";
import { gamificationService } from "@/services/gamification.service";
import type { ActionResult } from "@/types";

/** Sincroniza as conquistas e devolve as recém-desbloqueadas (para o toast). */
export async function syncAchievementsAction(): Promise<
  ActionResult<{ unlocked: { title: string; points: number }[] }>
> {
  try {
    await requireAdmin();

    const unlocked = await gamificationService.sync();
    if (unlocked.length > 0) {
      revalidatePath("/admin");
    }

    return { ok: true, data: { unlocked } };
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado.") {
      return { ok: false, error: "Sessão expirada." };
    }
    console.error("[gamification.actions]", error);
    return { ok: false, error: "Não foi possível sincronizar as conquistas." };
  }
}
