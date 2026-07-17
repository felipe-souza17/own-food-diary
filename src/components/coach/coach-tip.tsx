import { Sparkles } from "lucide-react";

import { RegenerateTipButton } from "@/components/coach/regenerate-tip-button";
import { coachService } from "@/services/coach.service";

/** Bloco da dica da IA (async — carregado em Suspense no CoachCard). */
export async function CoachTip() {
  const { tip, aiEnabled, snapshot } = await coachService.getTodayTip();

  if (!aiEnabled) {
    return (
      <p className="text-sm text-zinc-500">
        Dica automática desativada. Defina <code>GEMINI_API_KEY</code> para receber sugestões do
        coach.
      </p>
    );
  }

  if (snapshot.goal <= 0) {
    return (
      <p className="text-sm text-zinc-500">
        Defina uma meta calórica em Configurações para o coach sugerir como distribuir o dia.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-emerald-50/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
          <Sparkles aria-hidden className="size-3.5" />
          Dica do coach
        </span>
        <RegenerateTipButton />
      </div>

      {tip ? (
        <p className="text-sm leading-relaxed text-zinc-700">{tip}</p>
      ) : (
        <p className="text-sm text-zinc-500">
          Não foi possível gerar a dica agora. Tente novamente em instantes.
        </p>
      )}

      <p className="text-xs text-zinc-400">
        Sugestão geral e automática — sua nutricionista continua sendo a autoridade.
      </p>
    </div>
  );
}

export function CoachTipSkeleton() {
  return (
    <div className="space-y-2 rounded-lg bg-zinc-50 p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-200" />
    </div>
  );
}
