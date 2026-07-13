import "server-only";

import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "app";

export const settingsRepository = {
  get() {
    return prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  },

  upsertCalorieGoal(calorieGoalKcal: number) {
    return prisma.appSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, calorieGoalKcal },
      update: { calorieGoalKcal },
    });
  },
};
