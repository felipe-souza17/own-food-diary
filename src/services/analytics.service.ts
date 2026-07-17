import "server-only";

import {
  CALORIE_CHART_DAYS,
  REVIEW_PERIOD_DAYS,
  WATER_DAILY_GOAL_ML,
} from "@/lib/constants";
import { dateStringToUTCDate, dateToInputValue, todayInputValue } from "@/lib/utils";
import { dailyLogRepository } from "@/repositories/daily-log.repository";
import { mealRepository } from "@/repositories/meal.repository";
import { settingsService } from "@/services/settings.service";
import type { CaloriePoint, CalorieSeries, Review, ReviewInsight } from "@/types";

interface DayAgg {
  consumed: number;
  mealCount: number;
  uncounted: number;
}

export const analyticsService = {
  /** Série contínua dos últimos `days` dias com as calorias (DONE) somadas por dia. */
  async getCalorieSeries(days = CALORIE_CHART_DAYS): Promise<CalorieSeries> {
    const end = dateStringToUTCDate(todayInputValue());
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const [meals, goal] = await Promise.all([
      mealRepository.findByDateRange(start, end),
      settingsService.getCalorieGoal(),
    ]);

    const sums = new Map<string, number>();
    for (const meal of meals) {
      if (meal.nutrition?.status === "DONE" && meal.nutrition.calories !== null) {
        const key = dateToInputValue(meal.date);
        sums.set(key, (sums.get(key) ?? 0) + meal.nutrition.calories);
      }
    }

    const points: CaloriePoint[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i);
      const dateKey = dateToInputValue(date);
      points.push({
        dateKey,
        date,
        calories: Math.round(sums.get(dateKey) ?? 0),
        hasCounted: sums.has(dateKey),
      });
    }

    return { points, goal };
  },

  /** Insights determinísticos dos últimos `days` dias (revisão do dashboard). */
  async getReview(days = REVIEW_PERIOD_DAYS): Promise<Review> {
    const end = dateStringToUTCDate(todayInputValue());
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const dates: { key: string; date: Date }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i);
      dates.push({ key: dateToInputValue(date), date });
    }

    const [meals, logs, goal] = await Promise.all([
      mealRepository.findByDateRange(start, end),
      dailyLogRepository.findByDates(dates.map((entry) => entry.date)),
      settingsService.getCalorieGoal(),
    ]);

    const byDay = new Map<string, DayAgg>();
    for (const meal of meals) {
      const key = dateToInputValue(meal.date);
      const agg = byDay.get(key) ?? { consumed: 0, mealCount: 0, uncounted: 0 };
      agg.mealCount += 1;
      if (meal.nutrition?.status === "DONE" && meal.nutrition.calories !== null) {
        agg.consumed += meal.nutrition.calories;
      } else if (meal.nutrition?.status !== "FREE_MEAL") {
        agg.uncounted += 1;
      }
      byDay.set(key, agg);
    }

    const waterByDay = new Map(logs.map((log) => [dateToInputValue(log.date), log.waterMl]));

    let daysTracked = 0;
    let daysWithinGoal = 0;
    let daysOverGoal = 0;
    let waterDaysMetGoal = 0;
    let totalUncounted = 0;
    let caloriesSum = 0;
    let countedDays = 0;

    for (const { key } of dates) {
      const agg = byDay.get(key);
      const water = waterByDay.get(key) ?? 0;
      if (water >= WATER_DAILY_GOAL_ML) waterDaysMetGoal += 1;

      if (!agg || agg.mealCount === 0) continue;
      daysTracked += 1;
      totalUncounted += agg.uncounted;

      if (agg.consumed > 0) {
        countedDays += 1;
        caloriesSum += agg.consumed;
        if (goal > 0 && agg.consumed > goal) daysOverGoal += 1;
        else if (goal > 0) daysWithinGoal += 1;
      }
    }

    // Sequência atual de dias registrando (a partir de hoje, para trás).
    let currentStreak = 0;
    for (let i = dates.length - 1; i >= 0; i--) {
      const dateEntry = dates[i];
      if (dateEntry && (byDay.get(dateEntry.key)?.mealCount ?? 0) > 0) currentStreak += 1;
      else break;
    }

    const daysWithoutRecord = days - daysTracked;
    const avgCalories = countedDays > 0 ? Math.round(caloriesSum / countedDays) : null;

    const insights: ReviewInsight[] = [];

    if (currentStreak >= 3) {
      insights.push({ tone: "positive", text: `Você registrou ${currentStreak} dias seguidos. Continue assim!` });
    }
    if (goal > 0 && daysWithinGoal > 0) {
      insights.push({
        tone: "positive",
        text: `${daysWithinGoal} ${daysWithinGoal === 1 ? "dia dentro" : "dias dentro"} da meta calórica.`,
      });
    }
    if (daysWithoutRecord > 0) {
      insights.push({
        tone: "attention",
        text: `${daysWithoutRecord} ${daysWithoutRecord === 1 ? "dia sem nenhum registro" : "dias sem nenhum registro"} no período.`,
      });
    }
    if (goal > 0 && daysOverGoal > 0) {
      insights.push({
        tone: "attention",
        text: `${daysOverGoal} ${daysOverGoal === 1 ? "dia acima" : "dias acima"} da meta — dá para equilibrar nos próximos.`,
      });
    }
    if (waterDaysMetGoal < days) {
      const below = days - waterDaysMetGoal;
      insights.push({
        tone: "attention",
        text: `Água abaixo da meta em ${below} ${below === 1 ? "dia" : "dias"}.`,
      });
    }
    if (totalUncounted > 0) {
      insights.push({
        tone: "attention",
        text: `${totalUncounted} ${totalUncounted === 1 ? "refeição sem cálculo" : "refeições sem cálculo"} — revise para o gráfico ficar completo.`,
      });
    }
    if (insights.length === 0 && daysTracked > 0) {
      insights.push({ tone: "positive", text: "Período redondo, sem pontos de atenção." });
    }

    return {
      days,
      daysTracked,
      daysWithoutRecord,
      daysWithinGoal,
      daysOverGoal,
      avgCalories,
      waterDaysMetGoal,
      currentStreak,
      totalUncounted,
      insights,
    };
  },
};
