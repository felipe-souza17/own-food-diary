import "server-only";

import { del } from "@vercel/blob";

export const blobService = {
  async deleteByUrls(urls: string[]): Promise<void> {
    if (urls.length === 0) return;

    try {
      await del(urls);
    } catch (error) {
      console.error("[blob] Falha ao excluir arquivos do Vercel Blob:", error);
    }
  },
};
