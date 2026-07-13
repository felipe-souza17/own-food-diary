import "server-only";

import { prisma } from "@/lib/prisma";

export const dailyLogRepository = {
  findByDate(date: Date) {
    return prisma.dailyLog.findUnique({ where: { date } });
  },

  findByDates(dates: Date[]) {
    if (dates.length === 0) return Promise.resolve([]);
    return prisma.dailyLog.findMany({ where: { date: { in: dates } } });
  },

  setWater(date: Date, waterMl: number) {
    return prisma.dailyLog.upsert({
      where: { date },
      create: { date, waterMl },
      update: { waterMl },
    });
  },

  async addWater(date: Date, deltaMl: number) {
    const existing = await prisma.dailyLog.findUnique({ where: { date } });
    const next = Math.max(0, (existing?.waterMl ?? 0) + deltaMl);

    return prisma.dailyLog.upsert({
      where: { date },
      create: { date, waterMl: next },
      update: { waterMl: next },
    });
  },
};
