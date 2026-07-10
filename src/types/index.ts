import type { Meal, MealImage, ShareLink } from "@prisma/client";

export type MealWithImages = Meal & { images: MealImage[] };

export interface PaginatedMeals {
  meals: MealWithImages[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MealsByDay {
  dateKey: string;
  date: Date;
  meals: MealWithImages[];
}

export interface DashboardStats {
  totalMeals: number;
  mealsToday: number;
  totalImages: number;
  hasActiveShareLink: boolean;
}

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export type { Meal, MealImage, ShareLink };
