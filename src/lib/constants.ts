export const MEAL_TYPES = [
  "BREAKFAST",
  "MORNING_SNACK",
  "LUNCH",
  "AFTERNOON_SNACK",
  "DINNER",
  "SUPPER",
  "OTHER",
] as const;

export type MealTypeValue = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealTypeValue, string> = {
  BREAKFAST: "Café da manhã",
  MORNING_SNACK: "Lanche da manhã",
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da tarde",
  DINNER: "Jantar",
  SUPPER: "Ceia",
  OTHER: "Outro",
};

export const MEAL_TYPE_BADGE_CLASSES: Record<MealTypeValue, string> = {
  BREAKFAST: "bg-amber-50 text-amber-700 ring-amber-600/20",
  MORNING_SNACK: "bg-lime-50 text-lime-700 ring-lime-600/20",
  LUNCH: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  AFTERNOON_SNACK: "bg-sky-50 text-sky-700 ring-sky-600/20",
  DINNER: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  SUPPER: "bg-violet-50 text-violet-700 ring-violet-600/20",
  OTHER: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
};

export const UPLOAD_BLOB_FOLDER = "diario-alimentar";
export const UPLOAD_MAX_SIZE_MB = 5;
export const UPLOAD_MAX_SIZE_BYTES = UPLOAD_MAX_SIZE_MB * 1024 * 1024;
export const UPLOAD_MAX_IMAGES_PER_MEAL = 10;
export const UPLOAD_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const MEALS_PAGE_SIZE = 10;

export const APP_NAME = "Diário Alimentar";

export const GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-lite";
export const NUTRITION_MACROS = ["protein", "carbs", "fat", "fiber"] as const;
export type NutritionMacro = (typeof NUTRITION_MACROS)[number];

export const NUTRITION_MACRO_LABELS: Record<NutritionMacro, string> = {
  protein: "Proteína",
  carbs: "Carboidrato",
  fat: "Gordura",
  fiber: "Fibra",
};

export const WATER_QUICK_ADD_ML = [200, 300, 500] as const;
export const WATER_DAILY_GOAL_ML = 2000;

export const CALORIE_GOAL_DEFAULT = 2000;
export const CALORIE_GOAL_MAX = 20000;
/** Quantidade de dias exibidos no gráfico de calorias. */
export const CALORIE_CHART_DAYS = 14;
/** Dias por página no diário público. */
export const PUBLIC_DIARY_DAYS_PER_PAGE = 7;

/**
 * Participação típica de cada refeição no total calórico do dia (soma = 1).
 * Usada pelo coach para redistribuir o orçamento entre as refeições restantes.
 * "OUTRO" fica fora do planejamento (peso 0).
 */
export const MEAL_TYPE_CALORIE_WEIGHTS: Record<MealTypeValue, number> = {
  BREAKFAST: 0.2,
  MORNING_SNACK: 0.05,
  LUNCH: 0.3,
  AFTERNOON_SNACK: 0.1,
  DINNER: 0.25,
  SUPPER: 0.1,
  OTHER: 0,
};

/** Dias considerados na revisão do dashboard. */
export const REVIEW_PERIOD_DAYS = 7;
