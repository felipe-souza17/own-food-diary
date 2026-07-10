import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100">
        <SearchX aria-hidden className="size-7 text-zinc-400" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-zinc-900">Página não encontrada</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          O endereço acessado não existe ou o link de compartilhamento foi desativado.
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
      >
        Ir para o início
      </Link>
    </main>
  );
}
