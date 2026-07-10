"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteMealAction } from "@/actions/meal.actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteMealButton({ mealId }: { mealId: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMealAction(mealId);
      setConfirmOpen(false);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Refeição excluída.");
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setConfirmOpen(true)}
        aria-label="Excluir refeição"
        title="Excluir"
        className="text-zinc-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 aria-hidden className="size-4" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir esta refeição?"
        description="A refeição e todas as suas fotos serão removidas permanentemente. Esta ação não pode ser desfeita."
        isLoading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
