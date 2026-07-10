"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

const SORT_OPTIONS = [
  { value: "desc", label: "Mais recentes primeiro" },
  { value: "asc", label: "Mais antigas primeiro" },
];

export function MealsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleSearch = useDebouncedCallback((query: string) => {
    updateParams({ q: query });
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
        />
        <Input
          type="search"
          placeholder="Pesquisar por descrição ou observações…"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(event) => handleSearch(event.target.value)}
          className="pl-9"
          aria-label="Pesquisar refeições"
        />
      </div>

      <div className="sm:w-56">
        <Select
          value={searchParams.get("sort") === "asc" ? "asc" : "desc"}
          onChange={(value) => updateParams({ sort: value })}
          options={SORT_OPTIONS}
          ariaLabel="Ordenar por data"
        />
      </div>
    </div>
  );
}
