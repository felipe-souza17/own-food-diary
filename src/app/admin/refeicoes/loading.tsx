import { Skeleton } from "@/components/ui/skeleton";

export default function MealsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-56" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
