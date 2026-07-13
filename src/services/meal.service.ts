import "server-only";

import type { MealType } from "@prisma/client";

import { MEALS_PAGE_SIZE } from "@/lib/constants";
import { dateStringToUTCDate, dateToInputValue } from "@/lib/utils";
import { dailyLogRepository } from "@/repositories/daily-log.repository";
import { mealRepository } from "@/repositories/meal.repository";
import { blobService } from "@/services/blob.service";
import { nutritionService } from "@/services/nutrition.service";
import type { MealListParams, MealFormValues } from "@/validators/meal.schema";
import type {
  DayTotals,
  MealsByDay,
  MealWithImages,
  PaginatedDiary,
  PaginatedMeals,
} from "@/types";

function emptyDayTotals(): DayTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, uncountedMeals: 0, waterMl: 0 };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Acumula os macros de uma refeição nos totais do dia (ou conta como não estimada). */
function accumulate(totals: DayTotals, meal: MealWithImages): void {
  const nutrition = meal.nutrition;

  if (nutrition?.status === "DONE" && nutrition.calories !== null) {
    totals.calories = round(totals.calories + nutrition.calories);
    totals.protein = round(totals.protein + (nutrition.protein ?? 0));
    totals.carbs = round(totals.carbs + (nutrition.carbs ?? 0));
    totals.fat = round(totals.fat + (nutrition.fat ?? 0));
    totals.fiber = round(totals.fiber + (nutrition.fiber ?? 0));
  } else {
    totals.uncountedMeals += 1;
  }
}

export function groupMealsByDay(meals: MealWithImages[]): MealsByDay[] {
  const groups = new Map<string, MealsByDay>();

  for (const meal of meals) {
    const dateKey = dateToInputValue(meal.date);
    let group = groups.get(dateKey);

    if (!group) {
      group = { dateKey, date: meal.date, meals: [], totals: emptyDayTotals() };
      groups.set(dateKey, group);
    }

    group.meals.push(meal);
    accumulate(group.totals, meal);
  }

  return [...groups.values()];
}

/** Preenche a água de cada dia a partir dos DailyLog correspondentes. */
async function attachWater(days: MealsByDay[]): Promise<void> {
  if (days.length === 0) return;

  const logs = await dailyLogRepository.findByDates(days.map((day) => day.date));
  const byDate = new Map(logs.map((log) => [dateToInputValue(log.date), log.waterMl]));

  for (const day of days) {
    day.totals.waterMl = byDate.get(day.dateKey) ?? 0;
  }
}

export const mealService = {
  async list(params: MealListParams): Promise<PaginatedMeals> {
    const { query, sort, page } = params;

    const [meals, total] = await Promise.all([
      mealRepository.findMany({
        query,
        sort,
        skip: (page - 1) * MEALS_PAGE_SIZE,
        take: MEALS_PAGE_SIZE,
      }),
      mealRepository.count(query),
    ]);

    return {
      meals,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / MEALS_PAGE_SIZE)),
    };
  },

  getById(id: string): Promise<MealWithImages | null> {
    return mealRepository.findById(id);
  },

  async getPublicDiary(): Promise<MealsByDay[]> {
    const meals = await mealRepository.findAllForPublicDiary();
    const days = groupMealsByDay(meals);
    await attachWater(days);
    return days;
  },

  async getPublicDiaryPage(page: number, perPage: number): Promise<PaginatedDiary> {
    const meals = await mealRepository.findAllForPublicDiary();
    const allDays = groupMealsByDay(meals);

    const totalDays = allDays.length;
    const totalPages = Math.max(1, Math.ceil(totalDays / perPage));
    const current = Math.min(Math.max(1, page), totalPages);

    const days = allDays.slice((current - 1) * perPage, current * perPage);
    await attachWater(days);

    return { days, page: current, totalPages, totalDays };
  },

  getRecent(take = 5): Promise<MealWithImages[]> {
    return mealRepository.findRecent(take);
  },

  async create(values: MealFormValues): Promise<MealWithImages> {
    const meal = await mealRepository.create({
      date: dateStringToUTCDate(values.date),
      mealType: values.mealType as MealType,
      description: values.description,
      notes: values.notes || null,
      images: values.images.map(({ url, pathname }) => ({ url, pathname })),
    });

    await nutritionService.analyzeAndSave(meal);
    return meal;
  },

  async update(id: string, values: MealFormValues): Promise<MealWithImages> {
    const existing = await mealRepository.findById(id);
    if (!existing) {
      throw new Error("Refeição não encontrada.");
    }

    const keptIds = new Set(
      values.images.map((image) => image.id).filter((imageId): imageId is string => !!imageId),
    );
    const removedImages = existing.images.filter((image) => !keptIds.has(image.id));

    const updated = await mealRepository.update(id, {
      date: dateStringToUTCDate(values.date),
      mealType: values.mealType as MealType,
      description: values.description,
      notes: values.notes || null,
      imageIdsToDelete: removedImages.map((image) => image.id),
      imagesToCreate: values.images
        .filter((image) => !image.id)
        .map(({ url, pathname }) => ({ url, pathname })),
    });

    await blobService.deleteByUrls(removedImages.map((image) => image.url));

    if (existing.description !== values.description) {
      await nutritionService.analyzeAndSave(updated);
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    const existing = await mealRepository.findById(id);
    if (!existing) {
      throw new Error("Refeição não encontrada.");
    }

    await mealRepository.delete(id);
    await blobService.deleteByUrls(existing.images.map((image) => image.url));
  },
};
