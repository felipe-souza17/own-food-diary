import "server-only";

import { CALORIE_CHART_DAYS } from "@/lib/constants";
import { dateStringToUTCDate, dateToInputValue, todayInputValue } from "@/lib/utils";
import { mealRepository } from "@/repositories/meal.repository";
import { settingsService } from "@/services/settings.service";
import type { CaloriePoint, CalorieSeries } from "@/types";

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
};
