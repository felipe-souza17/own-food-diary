"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { syncAchievementsAction } from "@/actions/gamification.actions";

/**
 * Sincroniza as conquistas ao abrir o dashboard (sem efeito colateral no render
 * do servidor) e comemora as recém-desbloqueadas com um toast.
 */
export function AchievementSync() {
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    syncAchievementsAction().then((result) => {
      if (!result.ok || result.data.unlocked.length === 0) return;

      const { unlocked } = result.data;

      // Muitas de uma vez (ex.: primeiro acesso com histórico) → um resumo.
      if (unlocked.length > 4) {
        const totalXp = unlocked.reduce((sum, achievement) => sum + achievement.points, 0);
        toast.success(`🏆 ${unlocked.length} conquistas desbloqueadas!`, {
          description: `+${totalXp} XP no total`,
          duration: 6000,
        });
      } else {
        unlocked.forEach((achievement, index) => {
          setTimeout(() => {
            toast.success(`🏆 Conquista desbloqueada: ${achievement.title}`, {
              description: `+${achievement.points} XP`,
              duration: 6000,
            });
          }, index * 600);
        });
      }

      router.refresh();
    });
  }, [router]);

  return null;
}
