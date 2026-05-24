import { Suspense } from "react";
import { signOutAction } from "@/actions/auth.actions";
import { JobFiltersBar } from "@/components/dashboard/job-filters";
import { JobList } from "@/components/dashboard/job-list";
import { JobListSkeleton } from "@/components/dashboard/job-list-skeleton";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ScrapingRunsRepository } from "@/repositories/jobs.repository";
import { formatDistanceToNow } from "date-fns";

async function getLastScrapeText(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const runsRepo = new ScrapingRunsRepository(supabase);
    const runs = await runsRepo.getRecent(1);
    const last = runs[0];
    if (!last?.finished_at) return null;

    return `Last scrape ${formatDistanceToNow(new Date(last.finished_at), { addSuffix: true })} · ${last.jobs_inserted} new, ${last.jobs_updated} updated`;
  } catch {
    return null;
  }
}

async function LastScrapeInfo() {
  const text = await getLastScrapeText();
  if (!text) return null;

  return <p className="text-xs text-zinc-500">{text}</p>;
}

export default function DashboardPage() {
  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/80">
              JobPulse
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
              Engineering Jobs
            </h1>
            <Suspense fallback={null}>
              <LastScrapeInfo />
            </Suspense>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-300">Filters</h2>
          <Suspense fallback={<JobListSkeleton />}>
            <JobFiltersBar />
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<JobListSkeleton />}>
            <JobList />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
