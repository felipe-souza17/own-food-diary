import { z } from "zod";

const nonNegative = z.number().min(0).max(100000);

export const nutritionItemSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  gramas: z.number().min(0).max(100000).nullable().default(null),
  calories: nonNegative.default(0),
  protein: nonNegative.default(0),
  carbs: nonNegative.default(0),
  fat: nonNegative.default(0),
  fiber: nonNegative.default(0),
});

/** Formato esperado da resposta JSON do Gemini. */
export const geminiResponseSchema = z.object({
  freeMeal: z.boolean().default(false),
  items: z.array(nutritionItemSchema).default([]),
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;

/** Ajuste manual dos totais nutricionais (formulário). */
export const nutritionManualSchema = z.object({
  calories: z.coerce.number().min(0).max(100000),
  protein: z.coerce.number().min(0).max(100000),
  carbs: z.coerce.number().min(0).max(100000),
  fat: z.coerce.number().min(0).max(100000),
  fiber: z.coerce.number().min(0).max(100000),
});

export type NutritionManualValues = z.infer<typeof nutritionManualSchema>;
