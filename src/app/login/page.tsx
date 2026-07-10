import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl shadow-sm">
            🥗
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-zinc-500">Entre para gerenciar seu diário.</p>
          </div>
        </div>

        <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
