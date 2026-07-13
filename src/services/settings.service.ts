import "server-only";

import { CALORIE_GOAL_DEFAULT, CALORIE_GOAL_MAX } from "@/lib/constants";
import { settingsRepository } from "@/repositories/settings.repository";

export const settingsService = {
  async getCalorieGoal(): Promise<number> {
    const settings = await settingsRepository.get();
    return settings?.calorieGoalKcal ?? CALORIE_GOAL_DEFAULT;
  },

  async setCalorieGoal(value: number): Promise<number> {
    const clamped = Math.min(CALORIE_GOAL_MAX, Math.max(0, Math.round(value)));
    const settings = await settingsRepository.upsertCalorieGoal(clamped);
    return settings.calorieGoalKcal;
  },
};
