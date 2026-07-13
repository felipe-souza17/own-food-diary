import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Flame, Images, Link2, Plus, TriangleAlert, UtensilsCrossed } from "lucide-react";

import { CalorieChartCard } from "@/components/charts/calorie-chart-card";
import { MealListItem } from "@/components/meals/meal-list-item";
import { ProcessPendingButton } from "@/components/nutrition/process-pending-button";
import { WaterControl } from "@/components/water/water-control";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { isGeminiEnabled } from "@/lib/gemini";
import { formatKcal } from "@/lib/nutrition-format";
import { todayInputValue } from "@/lib/utils";
import { analyticsService } from "@/services/analytics.service";
import { dashboardService } from "@/services/dashboard.service";
import { mealService } from "@/services/meal.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

/** Folga para o botão "Analisar pendentes" processar um lote via IA. */
export const maxDuration = 60;

const statCards = [
  { key: "totalMeals", label: "Refeições registradas", icon: UtensilsCrossed },
  { key: "mealsToday", label: "Refeições hoje", icon: CalendarCheck },
  { key: "totalImages", label: "Fotos enviadas", icon: Images },
] as const;

export default async function DashboardPage() {
  const [stats, recentMeals, calorieSeries] = await Promise.all([
    dashboardService.getStats(),
    mealService.getRecent(5),
    analyticsService.getCalorieSeries(),
  ]);
  const today = todayInputValue();
  const aiEnabled = isGeminiEnabled();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu diário alimentar."
        actions={
          <Link
            href="/admin/refeicoes/nova"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <Plus aria-hidden className="size-4" />
            Nova refeição
          </Link>
        }
      />

      {aiEnabled && stats.mealsNeedingAttention > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <TriangleAlert aria-hidden className="size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{stats.mealsNeedingAttention}</span>{" "}
              {stats.mealsNeedingAttention === 1
                ? "refeição está sem cálculo nutricional"
                : "refeições estão sem cálculo nutricional"}
              .
            </p>
          </div>
          <ProcessPendingButton />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="p-5 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <Icon aria-hidden className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats[key]}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-5 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Link2 aria-hidden className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {stats.hasActiveShareLink ? "Ativo" : "Inativo"}
              </p>
              <p className="text-xs text-zinc-500">Link de compartilhamento</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame aria-hidden className="size-4 text-emerald-600" />
              Calorias de hoje
            </CardTitle>
            {aiEnabled && <ProcessPendingButton />}
          </CardHeader>
          <CardContent>
            {stats.caloriesToday !== null ? (
              <p className="text-3xl font-bold text-zinc-900">{formatKcal(stats.caloriesToday)}</p>
            ) : (
              <p className="text-sm text-zinc-500">
                {stats.mealsToday > 0
                  ? "Refeições de hoje ainda sem cálculo nutricional."
                  : "Nenhuma refeição registrada hoje."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Água de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterControl dateString={today} initialMl={stats.waterToday} />
          </CardContent>
        </Card>
      </div>

      <CalorieChartCard series={calorieSeries} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimas refeições</CardTitle>
          <Link
            href="/admin/refeicoes"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {recentMeals.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="Nenhuma refeição ainda"
              description="Registre sua primeira refeição para começar o diário."
              action={
                <Link
                  href="/admin/refeicoes/nova"
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <Plus aria-hidden className="size-4" />
                  Registrar refeição
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentMeals.map((meal) => (
                <MealListItem key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
