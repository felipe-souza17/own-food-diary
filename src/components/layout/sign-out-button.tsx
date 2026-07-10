"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      isLoading={isPending}
      onClick={() => startTransition(() => logoutAction())}
      title="Sair"
    >
      {!isPending && <LogOut aria-hidden className="size-4" />}
      <span className="hidden sm:inline">Sair</span>
    </Button>
  );
}
