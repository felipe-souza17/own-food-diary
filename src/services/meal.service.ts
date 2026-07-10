import "server-only";

import type { MealType } from "@prisma/client";

import { MEALS_PAGE_SIZE } from "@/lib/constants";
import { dateStringToUTCDate, dateToInputValue } from "@/lib/utils";
import { mealRepository } from "@/repositories/meal.repository";
import { blobService } from "@/services/blob.service";
import type { MealListParams, MealFormValues } from "@/validators/meal.schema";
import type { MealsByDay, MealWithImages, PaginatedMeals } from "@/types";

export function groupMealsByDay(meals: MealWithImages[]): MealsByDay[] {
  const groups = new Map<string, MealsByDay>();

  for (const meal of meals) {
    const dateKey = dateToInputValue(meal.date);
    const group = groups.get(dateKey);

    if (group) {
      group.meals.push(meal);
    } else {
      groups.set(dateKey, { dateKey, date: meal.date, meals: [meal] });
    }
  }

  return [...groups.values()];
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
    return groupMealsByDay(meals);
  },

  getRecent(take = 5): Promise<MealWithImages[]> {
    return mealRepository.findRecent(take);
  },

  create(values: MealFormValues): Promise<MealWithImages> {
    return mealRepository.create({
      date: dateStringToUTCDate(values.date),
      mealType: values.mealType as MealType,
      description: values.description,
      notes: values.notes || null,
      images: values.images.map(({ url, pathname }) => ({ url, pathname })),
    });
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
