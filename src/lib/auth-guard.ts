import "server-only";

import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Não autorizado.");
  }

  return session;
}
