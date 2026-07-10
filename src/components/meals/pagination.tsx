import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));

  return `/admin/refeicoes?${params.toString()}`;
}

export function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClasses = (disabled: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50",
      disabled && "pointer-events-none opacity-40",
    );

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between">
      <Link
        href={buildHref(searchParams, page - 1)}
        aria-disabled={page <= 1}
        className={linkClasses(page <= 1)}
      >
        <ChevronLeft aria-hidden className="size-4" />
        Anterior
      </Link>

      <span className="text-sm text-zinc-500">
        Página <span className="font-medium text-zinc-900">{page}</span> de{" "}
        <span className="font-medium text-zinc-900">{totalPages}</span>
      </span>

      <Link
        href={buildHref(searchParams, page + 1)}
        aria-disabled={page >= totalPages}
        className={linkClasses(page >= totalPages)}
      >
        Próxima
        <ChevronRight aria-hidden className="size-4" />
      </Link>
    </nav>
  );
}
