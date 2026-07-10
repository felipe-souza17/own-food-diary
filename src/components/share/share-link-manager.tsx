"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2, RefreshCw, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import {
  getOrCreateShareLinkAction,
  regenerateShareLinkAction,
  revokeShareLinkAction,
} from "@/actions/share.actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ShareLinkManagerProps {
  initialToken: string | null;
  baseUrl: string;
}

export function ShareLinkManager({ initialToken, baseUrl }: ShareLinkManagerProps) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"regenerate" | "revoke" | null>(null);
  const [isPending, startTransition] = useTransition();

  const shareUrl = token ? `${baseUrl}/share/${token}` : null;

  function handleCreate() {
    startTransition(async () => {
      const result = await getOrCreateShareLinkAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setToken(result.data.token);
      toast.success("Link de compartilhamento gerado!");
    });
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateShareLinkAction();
      setConfirmAction(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setToken(result.data.token);
      toast.success("Novo link gerado. O link anterior foi invalidado.");
    });
  }

  function handleRevoke() {
    startTransition(async () => {
      const result = await revokeShareLinkAction();
      setConfirmAction(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setToken(null);
      toast.success("Compartilhamento desativado.");
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  if (!shareUrl) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-500">
          Nenhum link ativo no momento. Gere um link para permitir que qualquer pessoa com ele
          visualize seu diário (somente leitura).
        </p>
        <Button onClick={handleCreate} isLoading={isPending}>
          {!isPending && <Link2 aria-hidden className="size-4" />}
          Gerar link de compartilhamento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
          {shareUrl}
        </code>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="md" onClick={handleCopy}>
            {copied ? (
              <Check aria-hidden className="size-4 text-emerald-600" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            Copiar
          </Button>
          <Link
            href={`/share/${token}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
          >
            <ExternalLink aria-hidden className="size-4" />
            Abrir
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmAction("regenerate")}
          disabled={isPending}
        >
          <RefreshCw aria-hidden className="size-4" />
          Gerar novo link
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmAction("revoke")}
          disabled={isPending}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <ShieldOff aria-hidden className="size-4" />
          Desativar compartilhamento
        </Button>
      </div>

      <ConfirmDialog
        open={confirmAction === "regenerate"}
        title="Gerar um novo link?"
        description="O link atual deixará de funcionar imediatamente. Quem tiver o link antigo perderá o acesso."
        confirmLabel="Gerar novo link"
        isLoading={isPending}
        onConfirm={handleRegenerate}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "revoke"}
        title="Desativar o compartilhamento?"
        description="Ninguém mais conseguirá acessar seu diário pelo link atual. Você pode gerar um novo link quando quiser."
        confirmLabel="Desativar"
        isLoading={isPending}
        onConfirm={handleRevoke}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
