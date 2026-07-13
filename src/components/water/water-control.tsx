"use client";

import { useState, useTransition } from "react";
import { Droplets, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { addWaterAction } from "@/actions/water.actions";
import { WATER_DAILY_GOAL_ML, WATER_QUICK_ADD_ML } from "@/lib/constants";
import { formatWater } from "@/lib/nutrition-format";
import { cn } from "@/lib/utils";

interface WaterControlProps {
  /** Dia alvo no formato "YYYY-MM-DD". */
  dateString: string;
  initialMl: number;
}

export function WaterControl({ dateString, initialMl }: WaterControlProps) {
  const [waterMl, setWaterMl] = useState(initialMl);
  const [isPending, startTransition] = useTransition();

  const percent = Math.min(100, Math.round((waterMl / WATER_DAILY_GOAL_ML) * 100));

  function change(deltaMl: number) {
    const previous = waterMl;
    setWaterMl((current) => Math.max(0, current + deltaMl));

    startTransition(async () => {
      const result = await addWaterAction(dateString, deltaMl);
      if (!result.ok) {
        setWaterMl(previous);
        toast.error(result.error);
        return;
      }
      setWaterMl(result.data.waterMl);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50">
            <Droplets aria-hidden className="size-5 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{formatWater(waterMl)}</p>
            <p className="text-xs text-zinc-500">Meta: {formatWater(WATER_DAILY_GOAL_ML)}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => change(-WATER_QUICK_ADD_ML[0])}
          disabled={isPending || waterMl === 0}
          aria-label="Remover água"
          className="flex size-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-zinc-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full bg-sky-500 transition-all duration-500")}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {WATER_QUICK_ADD_ML.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => change(amount)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-50"
          >
            <Plus className="size-3" />
            {amount} ml
          </button>
        ))}
      </div>
    </div>
  );
}
