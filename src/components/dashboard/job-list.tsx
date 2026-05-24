"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import type { Job } from "@/lib/types/job";
import { JobCard } from "./job-card";
import { JobListSkeleton } from "./job-list-skeleton";
import { EmptyJobsState } from "./empty-state";
import { Button } from "@/components/ui/button";

type JobsResponse = {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

async function fetchJobs(params: URLSearchParams): Promise<JobsResponse> {
  const res = await fetch(`/api/jobs?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to load jobs");
  }
  return res.json();
}

export function JobList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["jobs", params.toString()],
    queryFn: () => fetchJobs(params),
  });

  if (isLoading) return <JobListSkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
        <p className="text-sm text-rose-300">
          {error instanceof Error ? error.message : "Failed to load jobs"}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.jobs.length === 0) {
    const hasFilters = [...params.keys()].some((k) => k !== "page");
    return <EmptyJobsState hasFilters={hasFilters} />;
  }

  const page = data.page;
  const totalPages = data.totalPages;

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(nextPage));
    router.push(`/dashboard?${next.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          {data.total} job{data.total === 1 ? "" : "s"}
          {isFetching && " · Updating..."}
        </span>
        <span>
          Page {page} of {totalPages || 1}
        </span>
      </div>

      <div className="space-y-3">
        {data.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
