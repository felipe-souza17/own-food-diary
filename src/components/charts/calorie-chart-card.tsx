import { TrendingUp } from "lucide-react";

import { CalorieChart, CalorieChartEmpty } from "@/components/charts/calorie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CALORIE_CHART_DAYS } from "@/lib/constants";
import type { CalorieSeries } from "@/types";

export function CalorieChartCard({ series }: { series: CalorieSeries }) {
  const hasData = series.points.some((point) => point.calories > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp aria-hidden className="size-4 text-emerald-600" />
          Calorias por dia
        </CardTitle>
        <p className="mt-0.5 text-sm text-zinc-500">Últimos {CALORIE_CHART_DAYS} dias</p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <CalorieChart points={series.points} goal={series.goal} />
        ) : (
          <CalorieChartEmpty />
        )}
      </CardContent>
    </Card>
  );
}
