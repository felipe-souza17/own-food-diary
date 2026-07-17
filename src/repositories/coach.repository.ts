import "server-only";

import { prisma } from "@/lib/prisma";

export const coachRepository = {
  findByDate(date: Date) {
    return prisma.dailyCoachTip.findUnique({ where: { date } });
  },

  upsert(date: Date, data: { tip: string; mealsHash: string; model: string | null }) {
    return prisma.dailyCoachTip.upsert({
      where: { date },
      create: { date, ...data },
      update: data,
    });
  },
};
