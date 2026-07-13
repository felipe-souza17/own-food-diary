import { CalendarDays } from "lucide-react";

import { DayTotals } from "@/components/nutrition/day-totals";
import { PublicMealCard } from "@/components/public/public-meal-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateLong } from "@/lib/utils";
import type { MealsByDay } from "@/types";

export function PublicDiary({ days }: { days: MealsByDay[] }) {
  if (days.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhuma refeição registrada ainda"
        description="Quando houver registros no diário, eles aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-10">
      {days.map((day, index) => (
        <section
          key={day.dateKey}
          aria-label={formatDateLong(day.date)}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
        >
          <div className="sticky top-0 z-10 -mx-4 mb-4 space-y-2 bg-zinc-50/90 px-4 py-2 backdrop-blur">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase first-letter:uppercase">
              {formatDateLong(day.date)}
            </h2>
            <DayTotals totals={day.totals} />
          </div>

          <div className="space-y-4">
            {day.meals.map((meal) => (
              <PublicMealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
