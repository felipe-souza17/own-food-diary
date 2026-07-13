import "server-only";

import { dateStringToUTCDate } from "@/lib/utils";
import { dailyLogRepository } from "@/repositories/daily-log.repository";

const MAX_WATER_ML = 20000;

function clampWater(ml: number): number {
  if (!Number.isFinite(ml)) return 0;
  return Math.min(MAX_WATER_ML, Math.max(0, Math.round(ml)));
}

export const dailyLogService = {
  async getWater(dateString: string): Promise<number> {
    const log = await dailyLogRepository.findByDate(dateStringToUTCDate(dateString));
    return log?.waterMl ?? 0;
  },

  async setWater(dateString: string, ml: number): Promise<number> {
    const log = await dailyLogRepository.setWater(dateStringToUTCDate(dateString), clampWater(ml));
    return log.waterMl;
  },

  async addWater(dateString: string, deltaMl: number): Promise<number> {
    const log = await dailyLogRepository.addWater(dateStringToUTCDate(dateString), Math.round(deltaMl));
    return log.waterMl;
  },
};
