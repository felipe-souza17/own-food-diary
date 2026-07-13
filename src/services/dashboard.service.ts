import "server-only";

import { dateStringToUTCDate, todayInputValue } from "@/lib/utils";
import { dailyLogService } from "@/services/daily-log.service";
import { mealRepository } from "@/repositories/meal.repository";
import { shareLinkRepository } from "@/repositories/share-link.repository";
import type { DashboardStats } from "@/types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const today = todayInputValue();
    const todayDate = dateStringToUTCDate(today);

    const [totalMeals, todayMeals, totalImages, activeLink, waterToday, mealsNeedingAttention] =
      await Promise.all([
        mealRepository.count(),
        mealRepository.findByDate(todayDate),
        mealRepository.countImages(),
        shareLinkRepository.findActive(),
        dailyLogService.getWater(today),
        mealRepository.countNeedingAttention(),
      ]);

    const countedToday = todayMeals.filter(
      (meal) => meal.nutrition?.status === "DONE" && meal.nutrition.calories !== null,
    );
    const caloriesToday =
      countedToday.length > 0
        ? Math.round(countedToday.reduce((sum, meal) => sum + (meal.nutrition?.calories ?? 0), 0))
        : null;

    return {
      totalMeals,
      mealsToday: todayMeals.length,
      totalImages,
      hasActiveShareLink: activeLink !== null,
      caloriesToday,
      waterToday,
      mealsNeedingAttention,
    };
  },
};
