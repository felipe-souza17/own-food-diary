import type { GamificationStats, LevelInfo } from "@/types";

export type AchievementCategory =
  | "Consistência"
  | "Meta"
  | "Hidratação"
  | "Registro"
  | "Marcos";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  /** Chave do ícone (mapeada para um componente lucide na UI). */
  icon: string;
  category: AchievementCategory;
  points: number;
  target: number;
  /** Valor atual do progresso (mesma unidade de `target`). */
  progress: (stats: GamificationStats) => number;
}

/**
 * Catálogo de conquistas. Cada uma é desbloqueada quando `progress >= target`.
 * Puramente determinístico — calculado a partir das estatísticas do diário.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  // Marcos
  {
    key: "MEALS_1",
    title: "Primeiro passo",
    description: "Registre sua primeira refeição.",
    icon: "sprout",
    category: "Marcos",
    points: 10,
    target: 1,
    progress: (s) => s.totalMeals,
  },
  {
    key: "DAYS_7",
    title: "Primeira semana",
    description: "Registre em 7 dias diferentes.",
    icon: "calendar-check",
    category: "Marcos",
    points: 15,
    target: 7,
    progress: (s) => s.totalDaysLogged,
  },
  {
    key: "DAYS_30",
    title: "Um mês de diário",
    description: "Registre em 30 dias diferentes.",
    icon: "calendar-heart",
    category: "Marcos",
    points: 40,
    target: 30,
    progress: (s) => s.totalDaysLogged,
  },
  {
    key: "MEALS_50",
    title: "Diário caprichado",
    description: "Registre 50 refeições no total.",
    icon: "utensils",
    category: "Marcos",
    points: 25,
    target: 50,
    progress: (s) => s.totalMeals,
  },
  {
    key: "MEALS_100",
    title: "Centurião",
    description: "Registre 100 refeições no total.",
    icon: "medal",
    category: "Marcos",
    points: 50,
    target: 100,
    progress: (s) => s.totalMeals,
  },

  // Consistência (sequência de dias registrando)
  {
    key: "STREAK_3",
    title: "Pegando o ritmo",
    description: "3 dias seguidos registrando.",
    icon: "flame",
    category: "Consistência",
    points: 10,
    target: 3,
    progress: (s) => s.longestLogStreak,
  },
  {
    key: "STREAK_7",
    title: "Uma semana firme",
    description: "7 dias seguidos registrando.",
    icon: "flame",
    category: "Consistência",
    points: 25,
    target: 7,
    progress: (s) => s.longestLogStreak,
  },
  {
    key: "STREAK_14",
    title: "Duas semanas",
    description: "14 dias seguidos registrando.",
    icon: "flame",
    category: "Consistência",
    points: 35,
    target: 14,
    progress: (s) => s.longestLogStreak,
  },
  {
    key: "STREAK_30",
    title: "Mês sem falhar",
    description: "30 dias seguidos registrando.",
    icon: "flame",
    category: "Consistência",
    points: 60,
    target: 30,
    progress: (s) => s.longestLogStreak,
  },

  // Meta calórica
  {
    key: "GOAL_1",
    title: "No alvo",
    description: "Fique dentro da meta calórica em 1 dia.",
    icon: "target",
    category: "Meta",
    points: 10,
    target: 1,
    progress: (s) => s.goalWithinTotal,
  },
  {
    key: "GOAL_STREAK_7",
    title: "Semana no alvo",
    description: "7 dias seguidos dentro da meta calórica.",
    icon: "target",
    category: "Meta",
    points: 35,
    target: 7,
    progress: (s) => s.goalWithinLongestStreak,
  },
  {
    key: "GOAL_TOTAL_30",
    title: "Equilíbrio",
    description: "Fique dentro da meta em 30 dias (no total).",
    icon: "scale",
    category: "Meta",
    points: 45,
    target: 30,
    progress: (s) => s.goalWithinTotal,
  },

  // Hidratação
  {
    key: "WATER_1",
    title: "Hidratado",
    description: "Bata a meta de água em 1 dia.",
    icon: "droplet",
    category: "Hidratação",
    points: 10,
    target: 1,
    progress: (s) => s.waterMetTotal,
  },
  {
    key: "WATER_STREAK_7",
    title: "Hidratação em dia",
    description: "7 dias seguidos batendo a meta de água.",
    icon: "droplets",
    category: "Hidratação",
    points: 30,
    target: 7,
    progress: (s) => s.waterMetLongestStreak,
  },
  {
    key: "WATER_TOTAL_30",
    title: "Fonte inesgotável",
    description: "Bata a meta de água em 30 dias (no total).",
    icon: "waves",
    category: "Hidratação",
    points: 45,
    target: 30,
    progress: (s) => s.waterMetTotal,
  },

  // Registro / qualidade
  {
    key: "VARIETY_ALL",
    title: "Prato variado",
    description: "Registre todos os 7 tipos de refeição ao menos uma vez.",
    icon: "shapes",
    category: "Registro",
    points: 20,
    target: 7,
    progress: (s) => s.distinctMealTypes,
  },
  {
    key: "COMPLETE_DAY",
    title: "Tudo calculado",
    description: "Tenha um dia com 3+ refeições, todas calculadas.",
    icon: "circle-check",
    category: "Registro",
    points: 20,
    target: 1,
    progress: (s) => s.completeDays,
  },
  {
    key: "PHOTOS_50",
    title: "Álbum cheio",
    description: "Envie 50 fotos de refeições.",
    icon: "camera",
    category: "Registro",
    points: 20,
    target: 50,
    progress: (s) => s.totalImages,
  },
];

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  "Consistência",
  "Meta",
  "Hidratação",
  "Registro",
  "Marcos",
];

interface LevelDef {
  level: number;
  title: string;
  floor: number;
}

const LEVELS: LevelDef[] = [
  { level: 1, title: "Iniciante", floor: 0 },
  { level: 2, title: "Aprendiz", floor: 40 },
  { level: 3, title: "Consistente", floor: 100 },
  { level: 4, title: "Dedicado", floor: 180 },
  { level: 5, title: "Disciplinado", floor: 280 },
  { level: 6, title: "Mestre do diário", floor: 400 },
];

export function isUnlocked(def: AchievementDef, stats: GamificationStats): boolean {
  return def.progress(stats) >= def.target;
}

/** Total de pontos das conquistas desbloqueadas. */
export function totalPoints(stats: GamificationStats): number {
  return ACHIEVEMENTS.reduce(
    (sum, def) => (isUnlocked(def, stats) ? sum + def.points : sum),
    0,
  );
}

export function levelForPoints(points: number): LevelInfo {
  let current = LEVELS[0]!;
  for (const level of LEVELS) {
    if (points >= level.floor) current = level;
  }
  const next = LEVELS.find((level) => level.floor > current.floor) ?? null;

  return {
    level: current.level,
    title: current.title,
    points,
    currentFloor: current.floor,
    nextFloor: next ? next.floor : null,
  };
}
