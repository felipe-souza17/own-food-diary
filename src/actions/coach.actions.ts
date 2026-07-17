"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-guard";
import { coachService } from "@/services/coach.service";
import type { ActionResult } from "@/types";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === "Não autorizado.") {
    return "Sessão expirada. Faça login novamente.";
  }
  console.error("[coach.actions]", error);
  return fallback;
}

/** Regenera a dica do coach para hoje (ignora o cache). */
export async function regenerateCoachTipAction(): Promise<ActionResult<{ tip: string }>> {
  try {
    await requireAdmin();

    const result = await coachService.getTodayTip(true);
    revalidatePath("/admin");

    if (!result.aiEnabled) {
      return { ok: false, error: "Dica indisponível (GEMINI_API_KEY ausente)." };
    }
    if (!result.tip) {
      return {
        ok: false,
        error:
          result.snapshot.goal <= 0
            ? "Defina uma meta calórica em Configurações para receber dicas."
            : "Não foi possível gerar a dica agora. Tente novamente.",
      };
    }

    return { ok: true, data: { tip: result.tip } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível gerar a dica.") };
  }
}
