import "server-only";

import type { NutritionStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type NutritionUpsertData = Omit<Prisma.MealNutritionUncheckedCreateInput, "mealId">;

export const nutritionRepository = {
  upsert(mealId: string, data: NutritionUpsertData) {
    return prisma.mealNutrition.upsert({
      where: { mealId },
      create: { mealId, ...data },
      update: data,
    });
  },

  findByMealId(mealId: string) {
    return prisma.mealNutrition.findUnique({ where: { mealId } });
  },

  /** IDs de refeições sem nutrição ainda calculada (para backfill/pendentes). */
  async findMealIdsToProcess(take: number): Promise<string[]> {
    const meals = await prisma.meal.findMany({
      where: {
        OR: [
          { nutrition: null },
          { nutrition: { status: { in: ["PENDING", "FAILED"] as NutritionStatus[] } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true },
    });

    return meals.map((meal) => meal.id);
  },

  countByStatus(status: NutritionStatus) {
    return prisma.mealNutrition.count({ where: { status } });
  },
};
