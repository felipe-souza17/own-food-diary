import "server-only";

import {
  ACHIEVEMENTS,
  isUnlocked,
  levelForPoints,
  totalPoints,
  type AchievementDef,
} from "@/lib/achievements";
import { WATER_DAILY_GOAL_ML } from "@/lib/constants";
import { dateStringToUTCDate, dateToInputValue, todayInputValue } from "@/lib/utils";
import { achievementRepository } from "@/repositories/achievement.repository";
import { dailyLogRepository } from "@/repositories/daily-log.repository";
import { mealRepository } from "@/repositories/meal.repository";
import { settingsService } from "@/services/settings.service";
import type { AchievementView, GamificationState, GamificationStats } from "@/types";

interface DayAgg {
  mealCount: number;
  consumed: number;
  uncounted: number;
}

function enumerateDayKeys(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  const end = dateStringToUTCDate(endKey);
  const cursor = dateStringToUTCDate(startKey);

  while (cursor <= end) {
    keys.push(dateToInputValue(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

function longestRun(keys: string[], member: Set<string>): number {
  let longest = 0;
  let run = 0;
  for (const key of keys) {
    run = member.has(key) ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  return longest;
}

function trailingRun(keys: string[], member: Set<string>): number {
  let run = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    if (key && member.has(key)) run += 1;
    else break;
  }
  return run;
}

async function computeStats(): Promise<GamificationStats> {
  const [rows, logs, totalImages, goal] = await Promise.all([
    mealRepository.findAllForStats(),
    dailyLogRepository.findAll(),
    mealRepository.countImages(),
    settingsService.getCalorieGoal(),
  ]);

  const byDay = new Map<string, DayAgg>();
  const distinctTypes = new Set<string>();

  for (const row of rows) {
    const key = dateToInputValue(row.date);
    const agg = byDay.get(key) ?? { mealCount: 0, consumed: 0, uncounted: 0 };
    agg.mealCount += 1;
    distinctTypes.add(row.mealType);

    const status = row.nutrition?.status ?? null;
    if (status === "DONE" && row.nutrition?.calories != null) {
      agg.consumed += row.nutrition.calories;
    } else if (status !== "FREE_MEAL") {
      agg.uncounted += 1;
    }
    byDay.set(key, agg);
  }

  const waterByDay = new Map(logs.map((log) => [dateToInputValue(log.date), log.waterMl]));

  const loggedSet = new Set(byDay.keys());
  const withinGoalSet = new Set<string>();
  let goalWithinTotal = 0;
  let completeDays = 0;

  for (const [key, agg] of byDay) {
    if (agg.mealCount >= 3 && agg.uncounted === 0) completeDays += 1;
    if (goal > 0 && agg.consumed > 0 && agg.consumed <= goal) {
      goalWithinTotal += 1;
      withinGoalSet.add(key);
    }
  }

  const waterMetSet = new Set<string>();
  let waterMetTotal = 0;
  for (const [key, waterMl] of waterByDay) {
    if (waterMl >= WATER_DAILY_GOAL_ML) {
      waterMetTotal += 1;
      waterMetSet.add(key);
    }
  }

  // Sequências: precisam de dias contínuos entre o primeiro registro e hoje.
  const todayKey = todayInputValue();
  const allKeys = [...loggedSet, ...waterMetSet].sort();
  const startKey = allKeys[0];

  let currentLogStreak = 0;
  let longestLogStreak = 0;
  let goalWithinLongestStreak = 0;
  let waterMetLongestStreak = 0;

  if (startKey) {
    const range = enumerateDayKeys(startKey < todayKey ? startKey : todayKey, todayKey);
    currentLogStreak = trailingRun(range, loggedSet);
    longestLogStreak = longestRun(range, loggedSet);
    goalWithinLongestStreak = longestRun(range, withinGoalSet);
    waterMetLongestStreak = longestRun(range, waterMetSet);
  }

  return {
    totalMeals: rows.length,
    totalImages,
    totalDaysLogged: byDay.size,
    currentLogStreak,
    longestLogStreak,
    goalWithinTotal,
    goalWithinLongestStreak,
    waterMetTotal,
    waterMetLongestStreak,
    distinctMealTypes: distinctTypes.size,
    completeDays,
  };
}

function toView(def: AchievementDef, stats: GamificationStats, unlockedAt: Date | null): AchievementView {
  const progress = def.progress(stats);
  return {
    key: def.key,
    title: def.title,
    description: def.description,
    icon: def.icon,
    category: def.category,
    points: def.points,
    target: def.target,
    progress: Math.min(progress, def.target),
    unlocked: progress >= def.target,
    unlockedAt,
  };
}

export const gamificationService = {
  async getState(): Promise<GamificationState> {
    const [stats, unlockedMap] = await Promise.all([computeStats(), achievementRepository.findMap()]);

    const achievements = ACHIEVEMENTS.map((def) =>
      toView(def, stats, unlockedMap.get(def.key) ?? null),
    );

    const points = totalPoints(stats);

    return {
      stats,
      achievements,
      level: levelForPoints(points),
      unlockedCount: achievements.filter((achievement) => achievement.unlocked).length,
      totalCount: ACHIEVEMENTS.length,
    };
  },

  /**
   * Persiste conquistas recém-atingidas e devolve as novas (para comemorar).
   * Idempotente — só insere o que ainda não está registrado.
   */
  async sync(): Promise<{ title: string; points: number }[]> {
    const [stats, unlockedMap] = await Promise.all([computeStats(), achievementRepository.findMap()]);

    const newlyUnlocked = ACHIEVEMENTS.filter(
      (def) => isUnlocked(def, stats) && !unlockedMap.has(def.key),
    );

    if (newlyUnlocked.length > 0) {
      await achievementRepository.insertMany(newlyUnlocked.map((def) => def.key));
    }

    return newlyUnlocked.map((def) => ({ title: def.title, points: def.points }));
  },
};
