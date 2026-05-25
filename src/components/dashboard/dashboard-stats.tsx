import type { ComponentType } from "react";
import { Briefcase, Bookmark, CheckCircle2, Clock3, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JobsRepository, ScrapingRunsRepository } from "@/repositories/jobs.repository";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
};

function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="border-zinc-800/80 bg-zinc-950/50">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-zinc-50">{value}</p>
          {hint && <p className="text-xs text-zinc-500">{hint}</p>}
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2">
          <Icon className="h-4 w-4 text-emerald-400" />
        </div>
      </CardContent>
    </Card>
  );
}

async function loadDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const jobsRepo = new JobsRepository(supabase);
  const runsRepo = new ScrapingRunsRepository(supabase);
  const stats = await jobsRepo.getDashboardStats(user.id);
  const runs = await runsRepo.getRecent(1);
  const lastRun = runs[0];

  return {
    stats,
    lastRun,
    sourceHint: Object.entries(stats.bySource)
      .map(([source, count]) => `${source} ${count}`)
      .join(" · "),
    lastScrapeHint: lastRun?.finished_at
      ? `${formatDistanceToNow(new Date(lastRun.finished_at), { addSuffix: true })} · +${lastRun.jobs_inserted} new`
      : "No completed runs yet",
  };
}

export async function DashboardStats() {
  let data;

  try {
    data = await loadDashboardStats();
  } catch {
    return null;
  }

  if (!data) return null;

  const { stats, lastRun, sourceHint, lastScrapeHint } = data;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total jobs"
        value={stats.totalJobs.toLocaleString()}
        hint={sourceHint || "No sources yet"}
        icon={Briefcase}
      />
      <StatCard
        label="Saved"
        value={stats.savedCount.toLocaleString()}
        hint="Bookmarked for follow-up"
        icon={Bookmark}
      />
      <StatCard
        label="Applied"
        value={stats.appliedCount.toLocaleString()}
        hint="Marked as submitted"
        icon={CheckCircle2}
      />
      <StatCard
        label="Last scrape"
        value={lastRun?.finished_at ? "Completed" : "Pending"}
        hint={lastScrapeHint}
        icon={lastRun ? Clock3 : Timer}
      />
    </div>
  );
}
