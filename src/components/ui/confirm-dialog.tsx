"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoading) onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !isLoading) onCancel();
      }}
      className="m-auto w-full max-w-md rounded-xl p-0 shadow-xl backdrop:bg-zinc-950/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <TriangleAlert aria-hidden className="size-5 text-red-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
