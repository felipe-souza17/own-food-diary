import Image from "next/image";

import { MealTypeBadge } from "@/components/meals/meal-type-badge";
import { Card } from "@/components/ui/card";
import type { MealWithImages } from "@/types";

export function PublicMealCard({ meal }: { meal: MealWithImages }) {
  return (
    <Card className="overflow-hidden hover:shadow-md">
      <div className="space-y-3 p-5">
        <MealTypeBadge mealType={meal.mealType} />

        <p className="text-sm leading-relaxed text-zinc-800">{meal.description}</p>

        {meal.notes && (
          <div className="rounded-lg bg-zinc-50 px-3.5 py-2.5">
            <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Observações</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">{meal.notes}</p>
          </div>
        )}

        {meal.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {meal.images.map((image) => (
              <a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
              >
                <Image
                  src={image.url}
                  alt={`Foto: ${meal.description}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
