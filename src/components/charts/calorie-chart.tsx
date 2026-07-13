"use client";

import { useState } from "react";

import { formatKcal } from "@/lib/nutrition-format";
import { cn, formatDateShort } from "@/lib/utils";
import type { CaloriePoint } from "@/types";

const COLORS = {
  under: "#059669",
  over: "#d03b3b",
  goalLine: "#52514e",
  grid: "#e1e0d9",
  baseline: "#c3c2b7",
  muted: "#898781",
};

const W = 700;
const H = 240;
const PAD = { top: 24, right: 16, bottom: 28, left: 16 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const BASELINE_Y = PAD.top + PLOT_H;

function topRoundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.min(r, h, w / 2);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    `L ${x + w - radius} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + radius}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
}

interface CalorieChartProps {
  points: CaloriePoint[];
  goal: number;
}

export function CalorieChart({ points, goal }: CalorieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const days = points.length;
  const maxCalories = points.reduce((max, point) => Math.max(max, point.calories), 0);
  const maxVal = Math.max(goal, maxCalories, 1) * 1.15;

  const slot = PLOT_W / days;
  const barWidth = Math.min(28, slot * 0.6);
  const y = (value: number) => PAD.top + PLOT_H * (1 - value / maxVal);
  const cx = (index: number) => PAD.left + (index + 0.5) * slot;

  const goalY = goal > 0 ? y(goal) : null;
  const active = hovered !== null ? points[hovered] : null;
  const activeDelta = active ? active.calories - goal : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: COLORS.under }} />
          Dentro da meta
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: COLORS.over }} />
          Acima da meta
        </span>
        {goal > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4" style={{ backgroundColor: COLORS.goalLine }} />
            Meta {formatKcal(goal)}
          </span>
        )}
      </div>

      <div className="relative">
        {active && active.hasCounted && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-zinc-900 px-2.5 py-1.5 text-center text-xs whitespace-nowrap text-white shadow-lg"
            style={{ left: `${(cx(hovered!) / W) * 100}%`, top: `${(y(active.calories) / H) * 100}%` }}
          >
            <span className="block font-semibold">{formatKcal(active.calories)}</span>
            <span className="block text-[11px] text-zinc-300">{formatDateShort(active.date)}</span>
            {goal > 0 && (
              <span
                className="block text-[11px] font-medium"
                style={{ color: activeDelta > 0 ? "#fca5a5" : "#6ee7b7" }}
              >
                {activeDelta > 0
                  ? `${formatKcal(activeDelta)} acima`
                  : `${formatKcal(Math.abs(activeDelta))} abaixo`}
              </span>
            )}
          </div>
        )}

        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Calorias por dia nos últimos ${days} dias${goal > 0 ? `, meta de ${goal} kcal` : ""}`}
          className="h-auto w-full"
        >
          <line x1={PAD.left} y1={BASELINE_Y} x2={W - PAD.right} y2={BASELINE_Y} stroke={COLORS.baseline} strokeWidth={1} />

          {goalY !== null && (
            <line
              x1={PAD.left}
              y1={goalY}
              x2={W - PAD.right}
              y2={goalY}
              stroke={COLORS.goalLine}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
          )}

          {points.map((point, index) => {
            const x = cx(index) - barWidth / 2;
            const isOver = goal > 0 && point.calories > goal;
            const isToday = index === days - 1;

            return (
              <g key={point.dateKey}>
                {point.calories > 0 &&
                  (isOver ? (
                    <>
                      <path
                        d={topRoundedRect(x, y(goal) + 2, barWidth, BASELINE_Y - y(goal) - 2, 0)}
                        fill={COLORS.under}
                      />
                      <path
                        d={topRoundedRect(x, y(point.calories), barWidth, y(goal) - y(point.calories), 4)}
                        fill={COLORS.over}
                      />
                    </>
                  ) : (
                    <path
                      d={topRoundedRect(x, y(point.calories), barWidth, BASELINE_Y - y(point.calories), 4)}
                      fill={COLORS.under}
                    />
                  ))}

                <text
                  x={cx(index)}
                  y={H - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fill={isToday ? "#0b0b0b" : COLORS.muted}
                  fontWeight={isToday ? 600 : 400}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {point.date.getUTCDate()}
                </text>

                <rect
                  x={cx(index) - slot / 2}
                  y={PAD.top}
                  width={slot}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <title>{`${formatDateShort(point.date)}: ${point.hasCounted ? formatKcal(point.calories) : "sem cálculo"}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>

      <table className="sr-only">
        <caption>Calorias por dia</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Calorias</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.dateKey}>
              <td>{formatDateShort(point.date)}</td>
              <td>{point.hasCounted ? formatKcal(point.calories) : "sem cálculo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Estado vazio do gráfico (sem nenhuma refeição calculada no período). */
export function CalorieChartEmpty() {
  return (
    <p className={cn("py-8 text-center text-sm text-zinc-500")}>
      Ainda não há calorias calculadas nos últimos dias.
    </p>
  );
}
