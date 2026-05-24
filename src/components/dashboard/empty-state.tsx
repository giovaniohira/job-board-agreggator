import { Briefcase, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyJobsState({ hasFilters }: { hasFilters?: boolean }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-16 text-center">
      {hasFilters ? (
        <SearchX className="mb-4 h-10 w-10 text-zinc-600" />
      ) : (
        <Briefcase className="mb-4 h-10 w-10 text-zinc-600" />
      )}
      <h3 className="text-lg font-semibold text-zinc-200">
        {hasFilters ? "No jobs match your filters" : "No jobs yet"}
      </h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {hasFilters
          ? "Try adjusting your filters or clearing the search to see more listings."
          : "Jobs will appear after the first scrape run. Cron runs twice daily at 07:00 and 18:00 UTC."}
      </p>
      {hasFilters && (
        <Button className="mt-6" variant="outline" asChild>
          <a href="/dashboard">Clear filters</a>
        </Button>
      )}
    </div>
  );
}
