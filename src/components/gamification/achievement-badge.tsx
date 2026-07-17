import {
  Award,
  Calendar,
  CalendarCheck,
  CalendarHeart,
  Camera,
  CircleCheck,
  Droplet,
  Droplets,
  Flame,
  type LucideIcon,
  Lock,
  Medal,
  Scale,
  Shapes,
  Sprout,
  Target,
  Utensils,
  Waves,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AchievementView } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  sprout: Sprout,
  "calendar-check": CalendarCheck,
  "calendar-heart": CalendarHeart,
  calendar: Calendar,
  utensils: Utensils,
  medal: Medal,
  flame: Flame,
  target: Target,
  scale: Scale,
  droplet: Droplet,
  droplets: Droplets,
  waves: Waves,
  shapes: Shapes,
  "circle-check": CircleCheck,
  camera: Camera,
};

export function AchievementBadge({ achievement }: { achievement: AchievementView }) {
  const Icon = ICONS[achievement.icon] ?? Award;
  const { unlocked, progress, target } = achievement;
  const percent = Math.min(100, Math.round((progress / target) * 100));

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3 transition-colors",
        unlocked ? "border-emerald-200 bg-emerald-50/50" : "border-zinc-200 bg-white",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          unlocked ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400",
        )}
      >
        {unlocked ? (
          <Icon aria-hidden className="size-5" />
        ) : (
          <Lock aria-hidden className="size-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm font-semibold",
              unlocked ? "text-zinc-900" : "text-zinc-500",
            )}
          >
            {achievement.title}
          </p>
          <span
            className={cn(
              "shrink-0 text-xs font-medium",
              unlocked ? "text-emerald-600" : "text-zinc-400",
            )}
          >
            +{achievement.points}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{achievement.description}</p>

        {!unlocked && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 tabular-nums">
              {progress}/{target}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
