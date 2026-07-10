import "server-only";

import { prisma } from "@/lib/prisma";

export const shareLinkRepository = {
  findActive() {
    return prisma.shareLink.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findActiveByToken(token: string) {
    return prisma.shareLink.findFirst({
      where: { token, isActive: true },
    });
  },

  async replaceActive(token: string) {
    const [, created] = await prisma.$transaction([
      prisma.shareLink.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      prisma.shareLink.create({ data: { token } }),
    ]);

    return created;
  },

  deactivateAll() {
    return prisma.shareLink.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  },
};
