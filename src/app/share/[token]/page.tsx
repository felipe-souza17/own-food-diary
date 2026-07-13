import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalorieChartCard } from "@/components/charts/calorie-chart-card";
import { Pagination } from "@/components/meals/pagination";
import { PublicDiary } from "@/components/public/public-diary";
import { APP_NAME, PUBLIC_DIARY_DAYS_PER_PAGE } from "@/lib/constants";
import { analyticsService } from "@/services/analytics.service";
import { mealService } from "@/services/meal.service";
import { shareLinkService } from "@/services/share-link.service";

export const revalidate = 60;

interface SharePageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Diário compartilhado",
  description: "Visualização pública e somente leitura de um diário alimentar.",
  robots: { index: false, follow: false },
};

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { token } = await params;
  const { page: pageParam } = await searchParams;

  const isValid = await shareLinkService.isValidToken(token);
  if (!isValid) {
    notFound();
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const [diary, calorieSeries] = await Promise.all([
    mealService.getPublicDiaryPage(page, PUBLIC_DIARY_DAYS_PER_PAGE),
    analyticsService.getCalorieSeries(),
  ]);

  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-xl">
            🥗
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">{APP_NAME}</h1>
            <p className="text-xs text-zinc-500">Visualização compartilhada · somente leitura</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <CalorieChartCard series={calorieSeries} />

        <PublicDiary days={diary.days} />

        <Pagination
          page={diary.page}
          totalPages={diary.totalPages}
          searchParams={{}}
          basePath={`/share/${token}`}
        />
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <p className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-zinc-400">
          Este diário foi compartilhado apenas para visualização.
        </p>
      </footer>
    </div>
  );
}
