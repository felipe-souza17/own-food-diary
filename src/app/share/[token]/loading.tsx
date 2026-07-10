import { Skeleton } from "@/components/ui/skeleton";

export default function ShareLoading() {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-5 w-64" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
