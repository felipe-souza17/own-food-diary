import { CheckCircle2, ClipboardList, Flame, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKcal } from "@/lib/nutrition-format";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2.5">
      <p className="text-lg font-bold text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList aria-hidden className="size-4 text-emerald-600" />
          Revisão dos últimos {review.days} dias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Média por dia"
            value={review.avgCalories !== null ? formatKcal(review.avgCalories) : "—"}
          />
          <StatTile label="Dias na meta" value={`${review.daysWithinGoal}/${review.days}`} />
          <StatTile label="Sequência" value={`${review.currentStreak} 🔥`} />
          <StatTile label="Água na meta" value={`${review.waterDaysMetGoal}/${review.days}`} />
        </div>

        <ul className="space-y-2">
          {review.insights.map((insight, index) => {
            const isPositive = insight.tone === "positive";
            const Icon = isPositive ? CheckCircle2 : TriangleAlert;

            return (
              <li key={index} className="flex items-start gap-2 text-sm">
                {insight.tone === "neutral" ? (
                  <Flame aria-hidden className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                ) : (
                  <Icon
                    aria-hidden
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isPositive ? "text-emerald-600" : "text-amber-600",
                    )}
                  />
                )}
                <span className="text-zinc-600">{insight.text}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
