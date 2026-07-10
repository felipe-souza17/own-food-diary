"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-guard";
import { shareLinkService } from "@/services/share-link.service";
import type { ActionResult } from "@/types";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === "Não autorizado.") {
    return "Sessão expirada. Faça login novamente.";
  }
  console.error("[share.actions]", error);
  return fallback;
}

export async function getOrCreateShareLinkAction(): Promise<ActionResult<{ token: string }>> {
  try {
    await requireAdmin();

    const link = await shareLinkService.getOrCreate();
    revalidatePath("/admin/configuracoes");

    return { ok: true, data: { token: link.token } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível gerar o link.") };
  }
}

export async function regenerateShareLinkAction(): Promise<ActionResult<{ token: string }>> {
  try {
    await requireAdmin();

    const link = await shareLinkService.regenerate();
    revalidatePath("/admin/configuracoes");

    return { ok: true, data: { token: link.token } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível gerar um novo link.") };
  }
}

export async function revokeShareLinkAction(): Promise<ActionResult> {
  try {
    await requireAdmin();

    await shareLinkService.revoke();
    revalidatePath("/admin/configuracoes");

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error, "Não foi possível revogar o link.") };
  }
}
