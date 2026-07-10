import "server-only";

import { generateShareToken } from "@/lib/token";
import { shareLinkRepository } from "@/repositories/share-link.repository";
import type { ShareLink } from "@prisma/client";

export const shareLinkService = {
  getActive(): Promise<ShareLink | null> {
    return shareLinkRepository.findActive();
  },

  async getOrCreate(): Promise<ShareLink> {
    const active = await shareLinkRepository.findActive();
    if (active) return active;

    return shareLinkRepository.replaceActive(generateShareToken());
  },

  regenerate(): Promise<ShareLink> {
    return shareLinkRepository.replaceActive(generateShareToken());
  },

  async revoke(): Promise<void> {
    await shareLinkRepository.deactivateAll();
  },

  async isValidToken(token: string): Promise<boolean> {
    if (!/^[0-9A-Za-z]{8,32}$/.test(token)) return false;

    const link = await shareLinkRepository.findActiveByToken(token);
    return link !== null;
  },
};
