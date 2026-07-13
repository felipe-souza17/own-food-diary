import "server-only";

import type { MealType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface MealSearchCriteria {
  query?: string;
  sort: "asc" | "desc";
  skip: number;
  take: number;
}

function buildSearchWhere(query?: string): Prisma.MealWhereInput {
  if (!query) return {};

  return {
    OR: [
      { description: { contains: query, mode: "insensitive" } },
      { notes: { contains: query, mode: "insensitive" } },
    ],
  };
}

export const mealRepository = {
  findMany(criteria: MealSearchCriteria) {
    return prisma.meal.findMany({
      where: buildSearchWhere(criteria.query),
      include: { images: { orderBy: { createdAt: "asc" } }, nutrition: true },
      orderBy: [{ date: criteria.sort }, { createdAt: criteria.sort }],
      skip: criteria.skip,
      take: criteria.take,
    });
  },

  count(query?: string) {
    return prisma.meal.count({ where: buildSearchWhere(query) });
  },

  findById(id: string) {
    return prisma.meal.findUnique({
      where: { id },
      include: { images: { orderBy: { createdAt: "asc" } }, nutrition: true },
    });
  },

  findAllForPublicDiary() {
    return prisma.meal.findMany({
      include: { images: { orderBy: { createdAt: "asc" } }, nutrition: true },
      orderBy: [{ date: "desc" }, { createdAt: "asc" }],
    });
  },

  findRecent(take: number) {
    return prisma.meal.findMany({
      include: { images: { orderBy: { createdAt: "asc" } }, nutrition: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take,
    });
  },

  create(data: {
    date: Date;
    mealType: MealType;
    description: string;
    notes: string | null;
    images: { url: string; pathname: string }[];
  }) {
    return prisma.meal.create({
      data: {
        date: data.date,
        mealType: data.mealType,
        description: data.description,
        notes: data.notes,
        images: { create: data.images },
      },
      include: { images: true, nutrition: true },
    });
  },

  update(
    id: string,
    data: {
      date: Date;
      mealType: MealType;
      description: string;
      notes: string | null;
      imageIdsToDelete: string[];
      imagesToCreate: { url: string; pathname: string }[];
    },
  ) {
    return prisma.meal.update({
      where: { id },
      data: {
        date: data.date,
        mealType: data.mealType,
        description: data.description,
        notes: data.notes,
        images: {
          deleteMany: data.imageIdsToDelete.length
            ? { id: { in: data.imageIdsToDelete } }
            : undefined,
          create: data.imagesToCreate,
        },
      },
      include: { images: true, nutrition: true },
    });
  },

  delete(id: string) {
    return prisma.meal.delete({ where: { id } });
  },

  countByDate(date: Date) {
    return prisma.meal.count({ where: { date } });
  },

  findByDate(date: Date) {
    return prisma.meal.findMany({
      where: { date },
      include: { images: { orderBy: { createdAt: "asc" } }, nutrition: true },
      orderBy: { createdAt: "asc" },
    });
  },

  /** Refeições (com nutrição) num intervalo de datas, para as séries do gráfico. */
  findByDateRange(from: Date, to: Date) {
    return prisma.meal.findMany({
      where: { date: { gte: from, lte: to } },
      include: { nutrition: true },
      orderBy: { date: "asc" },
    });
  },

  countNeedingAttention() {
    return prisma.mealNutrition.count({ where: { status: { in: ["PENDING", "FAILED"] } } });
  },

  countImages() {
    return prisma.mealImage.count();
  },
};
