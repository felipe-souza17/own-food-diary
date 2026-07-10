"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginValues } from "@/validators/auth.schema";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setServerError(null);

    startTransition(async () => {
      const result = await loginAction(values, searchParams.get("callbackUrl") ?? undefined);

      if (!result.ok) {
        setServerError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@exemplo.com"
              aria-invalid={!!errors.email}
              disabled={isPending}
              {...register("email")}
            />
          </FormField>

          <FormField label="Senha" htmlFor="password" required error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              disabled={isPending}
              {...register("password")}
            />
          </FormField>

          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
            {!isPending && <LogIn aria-hidden className="size-4" />}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
