import { Skeleton } from "@/components/ui/skeleton";

export function JobListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5"
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
