import { Flame, Trophy } from "lucide-react";

import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { LevelBar } from "@/components/gamification/level-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/achievements";
import { gamificationService } from "@/services/gamification.service";

export async function AchievementsCard() {
  const state = await gamificationService.getState();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy aria-hidden className="size-4 text-emerald-600" />
          Conquistas
        </CardTitle>
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
          <Flame aria-hidden className="size-4 text-orange-500" />
          {state.stats.currentLogStreak}{" "}
          {state.stats.currentLogStreak === 1 ? "dia seguido" : "dias seguidos"}
        </span>
      </CardHeader>

      <CardContent className="space-y-6">
        <LevelBar
          level={state.level}
          unlockedCount={state.unlockedCount}
          totalCount={state.totalCount}
        />

        {ACHIEVEMENT_CATEGORIES.map((category) => {
          const items = state.achievements.filter(
            (achievement) => achievement.category === category,
          );
          if (items.length === 0) return null;

          return (
            <section key={category} className="space-y-2.5">
              <h3 className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                {category}
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {items.map((achievement) => (
                  <AchievementBadge key={achievement.key} achievement={achievement} />
                ))}
              </div>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
