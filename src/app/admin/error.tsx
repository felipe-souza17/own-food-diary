"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50/50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
        <CircleAlert aria-hidden className="size-6 text-red-600" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-zinc-900">Algo deu errado</h2>
        <p className="max-w-sm text-sm text-zinc-500">
          Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
