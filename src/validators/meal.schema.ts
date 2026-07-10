import { z } from "zod";

import { MEAL_TYPES, UPLOAD_MAX_IMAGES_PER_MEAL } from "@/lib/constants";

export const mealImageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url("URL de imagem inválida."),
  pathname: z.string().min(1, "Pathname da imagem ausente."),
});

export const mealFormSchema = z.object({
  date: z
    .string({ required_error: "Informe a data." })
    .min(1, "Informe a data.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
  mealType: z.enum(MEAL_TYPES, {
    errorMap: () => ({ message: "Selecione o tipo da refeição." }),
  }),
  description: z
    .string({ required_error: "Informe a descrição." })
    .trim()
    .min(3, "A descrição deve ter pelo menos 3 caracteres.")
    .max(500, "A descrição deve ter no máximo 500 caracteres."),
  notes: z
    .string()
    .trim()
    .max(1000, "As observações devem ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
  images: z
    .array(mealImageSchema)
    .max(
      UPLOAD_MAX_IMAGES_PER_MEAL,
      `No máximo ${UPLOAD_MAX_IMAGES_PER_MEAL} imagens por refeição.`,
    )
    .default([]),
});

export type MealFormValues = z.infer<typeof mealFormSchema>;
export type MealImageValue = z.infer<typeof mealImageSchema>;

export const mealListParamsSchema = z.object({
  query: z.string().trim().max(100).optional().default(""),
  sort: z.enum(["desc", "asc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type MealListParams = z.infer<typeof mealListParamsSchema>;
