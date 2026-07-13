import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { DeleteMealButton } from "@/components/meals/delete-meal-button";
import { MealTypeBadge } from "@/components/meals/meal-type-badge";
import { NutritionBadge } from "@/components/nutrition/nutrition-badge";
import { Card } from "@/components/ui/card";
import { formatDateShort, truncate } from "@/lib/utils";
import type { MealWithImages } from "@/types";

export function MealListItem({ meal }: { meal: MealWithImages }) {
  const [firstImage] = meal.images;

  return (
    <Card className="group flex animate-fade-in-up items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={`Foto: ${meal.description}`}
            fill
            sizes="64px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xl">🍽️</div>
        )}
        {meal.images.length > 1 && (
          <span className="absolute right-0.5 bottom-0.5 rounded bg-zinc-950/70 px-1 text-[10px] font-medium text-white">
            +{meal.images.length - 1}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <MealTypeBadge mealType={meal.mealType} />
          <time dateTime={meal.date.toISOString()} className="text-xs font-medium text-zinc-500">
            {formatDateShort(meal.date)}
          </time>
        </div>
        <p className="truncate text-sm font-medium text-zinc-900">{meal.description}</p>
        {meal.notes && (
          <p className="truncate text-xs text-zinc-500">{truncate(meal.notes, 120)}</p>
        )}
        <NutritionBadge nutrition={meal.nutrition} showEmpty className="pt-0.5" />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/admin/refeicoes/${meal.id}/editar`}
          aria-label="Editar refeição"
          title="Editar"
          className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Pencil aria-hidden className="size-4" />
        </Link>
        <DeleteMealButton mealId={meal.id} />
      </div>
    </Card>
  );
}
