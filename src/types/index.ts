import type { DailyLog, Meal, MealImage, MealNutrition, ShareLink } from "@prisma/client";

export type MealWithImages = Meal & {
  images: MealImage[];
  nutrition: MealNutrition | null;
};

export interface NutritionItem {
  nome: string;
  gramas: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface PaginatedMeals {
  meals: MealWithImages[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DayTotals extends NutritionTotals {
  /** Refeições do dia sem estimativa (livres ou não calculadas). */
  uncountedMeals: number;
  waterMl: number;
}

export interface MealsByDay {
  dateKey: string;
  date: Date;
  meals: MealWithImages[];
  totals: DayTotals;
}

export interface PaginatedDiary {
  days: MealsByDay[];
  page: number;
  totalPages: number;
  totalDays: number;
}

export interface DashboardStats {
  totalMeals: number;
  mealsToday: number;
  totalImages: number;
  hasActiveShareLink: boolean;
  caloriesToday: number | null;
  waterToday: number;
  mealsNeedingAttention: number;
}

export interface CaloriePoint {
  dateKey: string;
  date: Date;
  calories: number;
  /** Houve ao menos uma refeição com cálculo naquele dia. */
  hasCounted: boolean;
}

export interface CalorieSeries {
  points: CaloriePoint[];
  goal: number;
}

export interface MealTypeConsumption {
  type: string;
  registered: boolean;
  count: number;
  calories: number;
}

export interface DaySnapshot {
  dateKey: string;
  goal: number;
  consumed: number;
  byType: MealTypeConsumption[];
}

export interface CoachTipResult {
  tip: string | null;
  snapshot: DaySnapshot;
  aiEnabled: boolean;
}

export interface ReviewInsight {
  tone: "positive" | "attention" | "neutral";
  text: string;
}

export interface Review {
  days: number;
  daysTracked: number;
  daysWithoutRecord: number;
  daysWithinGoal: number;
  daysOverGoal: number;
  avgCalories: number | null;
  waterDaysMetGoal: number;
  currentStreak: number;
  totalUncounted: number;
  insights: ReviewInsight[];
}

export interface GamificationStats {
  totalMeals: number;
  totalImages: number;
  totalDaysLogged: number;
  currentLogStreak: number;
  longestLogStreak: number;
  goalWithinTotal: number;
  goalWithinLongestStreak: number;
  waterMetTotal: number;
  waterMetLongestStreak: number;
  distinctMealTypes: number;
  completeDays: number;
}

export interface AchievementView {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  target: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: Date | null;
}

export interface LevelInfo {
  level: number;
  title: string;
  points: number;
  currentFloor: number;
  nextFloor: number | null;
}

export interface GamificationState {
  stats: GamificationStats;
  achievements: AchievementView[];
  level: LevelInfo;
  unlockedCount: number;
  totalCount: number;
}

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export type { DailyLog, Meal, MealImage, MealNutrition, ShareLink };
