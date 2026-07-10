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
