import "server-only";

import { dateStringToUTCDate, todayInputValue } from "@/lib/utils";
import { mealRepository } from "@/repositories/meal.repository";
import { shareLinkRepository } from "@/repositories/share-link.repository";
import type { DashboardStats } from "@/types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [totalMeals, mealsToday, totalImages, activeLink] = await Promise.all([
      mealRepository.count(),
      mealRepository.countByDate(dateStringToUTCDate(todayInputValue())),
      mealRepository.countImages(),
      shareLinkRepository.findActive(),
    ]);

    return {
      totalMeals,
      mealsToday,
      totalImages,
      hasActiveShareLink: activeLink !== null,
    };
  },
};
