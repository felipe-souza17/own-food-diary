const kcalFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const gramFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatKcal(value: number): string {
  return `${kcalFormatter.format(Math.round(value))} kcal`;
}

export function formatGrams(value: number): string {
  return `${gramFormatter.format(value)} g`;
}

/** Formata mililitros como "1,5 L" (>= 1000) ou "500 ml". */
export function formatWater(ml: number): string {
  if (ml >= 1000) {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(ml / 1000)} L`;
  }
  return `${kcalFormatter.format(ml)} ml`;
}
