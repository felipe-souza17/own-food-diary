import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { MealForm } from "@/components/meals/meal-form";
import { NutritionPanel } from "@/components/nutrition/nutrition-panel";
import { PageHeader } from "@/components/ui/page-header";
import { isGeminiEnabled } from "@/lib/gemini";
import { dateToInputValue } from "@/lib/utils";
import { mealService } from "@/services/meal.service";

export const metadata: Metadata = {
  title: "Editar refeição",
};

interface EditMealPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMealPage({ params }: EditMealPageProps) {
  const { id } = await params;

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const meal = await mealService.getById(id);
  if (!meal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar refeição"
        description="Atualize as informações ou as fotos desta refeição."
      />
      <MealForm
        meal={{
          id: meal.id,
          date: dateToInputValue(meal.date),
          mealType: meal.mealType,
          description: meal.description,
          notes: meal.notes ?? "",
          images: meal.images.map((image) => ({
            id: image.id,
            url: image.url,
            pathname: image.pathname,
          })),
        }}
      />

      <NutritionPanel mealId={meal.id} nutrition={meal.nutrition} aiEnabled={isGeminiEnabled()} />
    </div>
  );
}
