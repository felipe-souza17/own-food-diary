import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100">
        <Icon aria-hidden className="size-6 text-zinc-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {description && <p className="max-w-sm text-sm text-zinc-500">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
