"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/validators/auth.schema";
import type { ActionResult } from "@/types";

export async function loginAction(
  values: LoginValues,
  callbackUrl?: string,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Verifique os campos." };
  }

  const redirectTo = callbackUrl?.startsWith("/") ? callbackUrl : "/admin";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error:
          error.type === "CredentialsSignin"
            ? "Email ou senha incorretos."
            : "Não foi possível entrar. Tente novamente.",
      };
    }

    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
