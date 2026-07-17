import { Star } from "lucide-react";

import type { LevelInfo } from "@/types";

export function LevelBar({ level, unlockedCount, totalCount }: {
  level: LevelInfo;
  unlockedCount: number;
  totalCount: number;
}) {
  const hasNext = level.nextFloor !== null;
  const span = hasNext ? level.nextFloor! - level.currentFloor : 1;
  const filled = hasNext ? level.points - level.currentFloor : 1;
  const percent = hasNext ? Math.min(100, Math.round((filled / span) * 100)) : 100;

  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Star aria-hidden className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">
              Nível {level.level} · {level.title}
            </p>
            <p className="text-xs text-emerald-100">
              {level.points} XP · {unlockedCount}/{totalCount} conquistas
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 text-right text-[11px] text-emerald-100">
        {hasNext ? `${level.nextFloor! - level.points} XP para o próximo nível` : "Nível máximo alcançado! 🎉"}
      </p>
    </div>
  );
}
