import "server-only";

import { prisma } from "@/lib/prisma";

export const achievementRepository = {
  async findMap(): Promise<Map<string, Date>> {
    const rows = await prisma.achievement.findMany({
      select: { key: true, unlockedAt: true },
    });
    return new Map(rows.map((row) => [row.key, row.unlockedAt]));
  },

  insertMany(keys: string[]) {
    if (keys.length === 0) return Promise.resolve({ count: 0 });
    return prisma.achievement.createMany({
      data: keys.map((key) => ({ key })),
      skipDuplicates: true,
    });
  },
};
