import type { Metadata } from "next";
import Link from "next/link";
import { Plus, SearchX, UtensilsCrossed } from "lucide-react";

import { MealListItem } from "@/components/meals/meal-list-item";
import { MealsToolbar } from "@/components/meals/meals-toolbar";
import { Pagination } from "@/components/meals/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { mealService } from "@/services/meal.service";
import { mealListParamsSchema } from "@/validators/meal.schema";

export const metadata: Metadata = {
  title: "Refeições",
};

interface MealsPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export default async function MealsPage({ searchParams }: MealsPageProps) {
  const rawParams = await searchParams;
  const params = mealListParamsSchema.parse({
    query: rawParams.q,
    sort: rawParams.sort === "asc" ? "asc" : "desc",
    page: rawParams.page,
  });

  const { meals, total, page, totalPages } = await mealService.list(params);
  const isSearching = params.query.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refeições"
        description={`${total} ${total === 1 ? "registro" : "registros"} no diário.`}
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

      <MealsToolbar />

      {meals.length === 0 ? (
        isSearching ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum resultado encontrado"
            description={`Nenhuma refeição corresponde a "${params.query}". Tente outra busca.`}
          />
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="Nenhuma refeição registrada"
            description="Comece registrando o que você comeu hoje."
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
        )
      ) : (
        <>
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealListItem key={meal.id} meal={meal} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            searchParams={{ q: rawParams.q, sort: rawParams.sort }}
          />
        </>
      )}
    </div>
  );
}
