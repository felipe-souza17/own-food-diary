"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";

import { getOrCreateShareLinkAction } from "@/actions/share.actions";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleShare() {
    startTransition(async () => {
      const result = await getOrCreateShareLinkAction();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setShareUrl(`${window.location.origin}/share/${result.data.token}`);
      setCopied(false);
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  if (shareUrl) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-1 pr-1 pl-3">
        <span className="hidden max-w-64 truncate text-xs font-medium text-emerald-800 sm:block">
          {shareUrl}
        </span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-emerald-700">
          {copied ? (
            <Check aria-hidden className="size-4" />
          ) : (
            <Copy aria-hidden className="size-4" />
          )}
          Copiar
        </Button>
        <button
          type="button"
          onClick={() => setShareUrl(null)}
          className="flex size-7 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-100"
          aria-label="Fechar"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} isLoading={isPending}>
      {!isPending && <Share2 aria-hidden className="size-4" />}
      Compartilhar
    </Button>
  );
}
