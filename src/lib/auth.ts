import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/validators/auth.schema";

function safeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufferA = encoder.encode(a);
  const bufferB = encoder.encode(b);

  const length = Math.max(bufferA.length, bufferB.length);
  let mismatch = bufferA.length === bufferB.length ? 0 : 1;

  for (let i = 0; i < length; i++) {
    mismatch |= (bufferA[i] ?? 0) ^ (bufferB[i] ?? 0);
  }

  return mismatch === 0;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
          console.error("[auth] ADMIN_EMAIL e/ou ADMIN_PASSWORD não configurados.");
          return null;
        }

        const { email, password } = parsed.data;
        const emailOk = safeCompare(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
        const passwordOk = safeCompare(password, adminPassword);

        if (!(emailOk && passwordOk)) return null;

        return {
          id: "admin",
          name: "Administrador",
          email: adminEmail,
        };
      },
    }),
  ],
});
